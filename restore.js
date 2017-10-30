const
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    flat = require('flat'),
    split = require('split'),
    kefir = require('kefir');

let stream = fs
    .createReadStream(path.join(process.cwd(), './data/sample.json'))
    .pipe(split());

// TBD: Filter raw stream to only contain deployment ids relevant to current user
let rawStream = kefir
    .fromEvents(stream, 'data')
    .takeUntilBy(kefir.fromEvents(stream, 'end').take(1))
    .filter(Boolean)
    .map(JSON.parse);

let documentModificationEventStream = rawStream
    .map(_.flow(_.partial(_.at, _, ["object.metadata.uid", "type", "object.spec"]), _.partial(_.zipObject, ["id", "type", "spec"])))
    .flatMap((function(deploymentMap){
        return ({ id, spec, type })=> type === "DELETED" ? (()=> { deploymentMap.delete(id); return kefir.constant({ id, type, spec }); })() : !_.isEqual(deploymentMap.get(id), spec) ? kefir.constant({ id, type, spec: deploymentMap.set(id, spec).get(id) }) : kefir.never();
    })(new Map()))
    .scan(_.concat, [])
    .last()
    .map(JSON.stringify)
    .onValue((contents)=> fs.writeFileSync('output.json', contents));