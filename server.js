const
    _ = require('lodash'),
    path = require('path'),
    kefir = require('kefir'),
    express = require('express'),
    Kubemote = require('kubemote');

let app = express(),
    kubeClient = new Kubemote(Kubemote.CONFIGURATION_FILE());

app.get('/log_real', (req, res)=> {

    res.set({
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive"
    });

    kefir
        .stream(({emit}) => {
            let destroy = _.noop;
            kubeClient.watchDeploymentList().then((func) => {
                destroy = func;
                emit();
            });
            return () => destroy();
        })
        .flatMap(() => kefir.fromEvents(kubeClient, 'watch').map((event) => ({timestamp: Date.now(), event})))
        .map((event) => [
            `event: data\n`,
            `data: ${JSON.stringify(event)}\n\n`
        ].join(''))
        .spy()
        .onValue(res.write.bind(res));

});

app.get('/log', (req, res)=> {
    res.sendFile(path.join(__dirname, './data/dump.jsonl'));
});
app.use(express.static('public'));
app.use('/', (req, res)=> {
    res.sendFile(path.join(__dirname, './index.html'));
});
app.listen(8080);