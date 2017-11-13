const
    _ = require('lodash'),
    path = require('path'),
    kefir = require('kefir'),
    express = require('express'),
    Kubemote = require('kubemote');

let
    kubeClient = new Kubemote(Kubemote.CONFIGURATION_FILE()),
    app = express();

/*let rawLogStream = kefir
    .stream(({ emit })=> {
        let destroy = _.noop;
        kubeClient.watchDeploymentList().then((func)=>{
            destroy = func;
            emit();
        });
        return ()=> destroy();
    })
    .flatMap(()=> kefir.fromEvents(kubeClient, 'watch').map((event)=> ({ time: Date.now(), event })));

let logCacheProperty = rawLogStream.scan(_.concat);

    
kefir.combine(
    [ kefir.stream(({ emit })=> app.get('/log', (req, res)=> emit({ req, res }))).toProperty() ],
    [ kefir.concat(rawLogStream.scan(_.concat))logProperty ]
).onValue(([{ req, res }, log])=> {
    res.send();
});*/

app.get('/log', (req, res)=> {
    res.sendFile(path.join(__dirname, './data/dump.jsonl'));
});
app.use(express.static('public'));
app.use('/', (req, res)=>{
    res.sendFile(path.join(__dirname, './index.html'));
});
app.listen(8080);