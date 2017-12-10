const
    _ = require('lodash'),
    path = require('path'),
    kefir = require('kefir'),
    express = require('express'),
    compression = require('compression'),
    Kubemote = require('kubemotelib');

const
    SECOND = 1000,
    MINUTE = 60 * SECOND,
    SSE_REFRESH_TIMER = MINUTE;

const
    configMap = {
        incluster: { test: (str)=> /^--in-cluster$/.test(str) },
        context: { test: (str)=> /^--context=/.test(str), parse: (str)=> _.last(str.match(/^--context=(.+)$/)) }
    },
    runArgs = process.argv.slice(2);

let config = _(configMap).mapValues((v, key)=> {
    let curArg = runArgs.find(v["test"]);
    return curArg && (v["parse"] || _.constant(true))(curArg);
}).pickBy(Boolean).value();

let app = express(),
    kubeClient = new Kubemote(config.incluster ? Kubemote.IN_CLUSTER_CONFIGURATION() : Kubemote.CONFIGURATION_FILE(config));

let eventStream = kefir
    .stream(({emit}) => {
        let destroy = _.noop;
        kubeClient.watchDeploymentList().then((func) => {
            destroy = func;
            emit();
        });
        return () => destroy();
    })
    .flatMap(() => kefir.fromEvents(kubeClient, 'watch').filter(_.matchesProperty('object.kind', 'Deployment')).map((event) => ({ timestamp: Date.now(), event })));

let eventBufferProperty = eventStream
    .slidingWindow(5000)
    .toProperty();

eventBufferProperty.onValue(_.noop);
app.use(compression());
app.get('/log', (req, res)=> {
    res.set({
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive"
    });

    res.removeHeader('Transfer-Encoding');

    kefir
        .concat([
            eventBufferProperty.take(1).flatten(),
            eventStream
        ])
        .map((event)=>({ type: "data", event }))
        .merge(kefir.repeat(()=> kefir.later(SSE_REFRESH_TIMER, { event: null })))
        .map(({ event, type })=> _.compact([
            type && `event: ${type}`,
            `data: ${JSON.stringify(event)}`,
        ]).concat(['\n']).join('\n'))
        .takeUntilBy(kefir.merge(["end", "close"].map((name)=> kefir.fromEvents(req, name))).take(1))
        .onValue((data)=> {
            res.write(data);
            res.flush();
        });
});

app.use(express.static(path.join(__dirname, '../../client/build')));
app.use((req, res)=> res.sendFile(path.join(__dirname, '../../client/build/index.html')));
app.listen(8080);