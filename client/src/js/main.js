import _ from "lodash";
import Kefir from "kefir";
import MurmurHash3 from "imurmurhash";
import ReactDOM from "react-dom";
import bodyView from "./ui/react_component/body_view";
import {
    MAIN_PAGE_DEPLOYMENT_LIST,
    MAIN_PAGE_DEPLOYMENT_REVISION_VIEW,
    MAIN_PAGE_DEPLOYMENT_INFO_VIEW
} from "./control/constant";

import "../style/main.less";
//import EventSource from "./eventsource_mock"; // <-- REMOVE THIS LINE BEFORE FLIGHT !!!

const
    VISUAL_BUFFER_SIZE = 5000,
    MINUTE = 1000 * 60;

const
    basePath = "/",
    ui = (function(){
        let emitter = _.noop;
        return {
            stream: Kefir.stream(({ emit })=> emitter = emit),
            send: (message)=> emitter(message)
        };
    })();

let urlStream = Kefir
    .fromEvents(window, 'popstate')
    .map(()=> window.location.pathname)
    .toProperty(()=> window.location.pathname);

let focusChangeStream = ui.stream
    .filter(_.matches({ type: "focus-deployment-revision" }))
    .merge(
        (function(regEx){
            return urlStream.filter((url)=> regEx.test(url)).map((url)=>{
                let [, id, hash] = url.match(regEx);
                return { id, hash: parseInt(hash, 16) }
            });
        })(new RegExp(basePath + "([a-z0-9-]{36})\/([0-9a-z]+)$"))
    )
    .map(({ id, hash })=> ({
        "main_page": MAIN_PAGE_DEPLOYMENT_REVISION_VIEW,
        "focused_deployment_id": id,
        "focused_deployment_revision": hash
    }));

let deploymentInformationStream = ui.stream
    .filter(_.matches({ type: "focus-deployment-information" }))
    .merge(
        (function(regEx){
            return urlStream.filter((url)=> regEx.test(url)).map((url)=>{
                let [, id] = url.match(regEx);
                return { id };
            });
        })(new RegExp(basePath + "([a-z0-9-]{36})$"))
    )
    .map(({ id })=>({
        "main_page": MAIN_PAGE_DEPLOYMENT_INFO_VIEW,
        "focused_deployment_id": id,
    }));

let backStream = ui.stream
    .filter(_.matches({ type: "show_deployment_list" }))
    .merge(urlStream.filter((url)=> url === basePath))
    .map(_.constant({ "main_page": MAIN_PAGE_DEPLOYMENT_LIST }));

let uiStateProperty = Kefir
    .merge([
        focusChangeStream,
        deploymentInformationStream,
        backStream
    ])
    .scan((ac, cur)=> _.merge({}, ac, cur), {
        "main_page": MAIN_PAGE_DEPLOYMENT_LIST,
        "focused_deployment_id": undefined,
        "focused_deployment_revision": undefined
    })
    .toProperty();

let rawStream = Kefir
    .fromEvents(new EventSource("/log"), 'data', _.flow(_.property('data'), JSON.parse));

let deploymentsProperty = rawStream
    .slidingWindow(VISUAL_BUFFER_SIZE)
    .debounce()
    .map(_.partial(_.sortBy, _, 'timestamp'))
    .map((buffer)=> {
        return _(buffer)
            .chain()
            .groupBy('event.object.metadata.uid')
            .map((events, id)=> _.assign({
                    id,
                    create: _.flow(_.first, _.property('event.object.metadata.creationTimestamp'), (utcStr)=> new Date(utcStr))(events),
                    name: _.flow(_.first, _.property('event.object.metadata.name'))(events),
                    revision: _(events)
                        .map(({ timestamp, event: { object: { spec } } })=>({
                            create: new Date(timestamp),
                            hash: MurmurHash3(JSON.stringify(spec)).result(),
                            spec
                        }))
                        .uniqBy('hash')
                        .value(),
                    online: _(events).chain().clone().reverse().map(_.flow(_.property('event.object.status.conditions'), _.partial(_.find, _, { type: "Available" }))).first().thru(({ status } = {})=> status === "True").value(),
                    destroy: _(events).chain().find({ event: { type: "DELETED" }}).get('timestamp').thru((utcStr)=> utcStr && new Date(utcStr)).value(),
                    raw: events
                },
                (function(lastEvent){
                    return {
                        "replica_desire": _.toInteger(_.get(lastEvent, 'event.object.spec.replicas')),
                        "replica_current": _.toInteger(_.get(lastEvent, 'event.object.status.replicas')),
                        "replica_up_to_date": _.toInteger(_.get(lastEvent, 'event.object.status.updatedReplicas')),
                        "replica_available": _.toInteger(_.get(lastEvent, 'event.object.status.availableReplicas'))
                    };
                })(_.last(events))
            ))
            .value();
    })
    .toProperty();

let domReadyProperty = Kefir
    .fromEvents(window, 'DOMContentLoaded')
    .take(1)
    .map(()=> document.querySelector('body'))
    .toProperty();

// History Management
uiStateProperty
    .map((state)=> {
        switch(state["main_page"]){
            case MAIN_PAGE_DEPLOYMENT_LIST:
                return basePath;
                break;
            case MAIN_PAGE_DEPLOYMENT_REVISION_VIEW:
                return basePath + [..._.zipWith([_.identity, (str)=> str.toString(16)] ,_.at(state, 'focused_deployment_id', 'focused_deployment_revision'), (f, d)=> f(d))].join('/');
                break;
            case MAIN_PAGE_DEPLOYMENT_INFO_VIEW:
                return basePath + _.get(state, 'focused_deployment_id');
                break;
        }
    })
    .skipDuplicates()
    .filter((newUrl)=> newUrl !== window.location.pathname)
    .onValue(_.partial(window.history.pushState.bind(window.history), {}, ''));

// UI Cycle
Kefir
    .combine([
        uiStateProperty,
        deploymentsProperty,
        domReadyProperty,
        Kefir.fromPoll(MINUTE, Date.now).toProperty(Date.now)  // Constant tick for all relative time captions
    ])
    .debounce()
    .onValue(function([uiState, deployments = [], mainElement, t]){
        return ReactDOM.render(bodyView(
            uiState,
            deployments,
            {
                onRevisionSelect: ({ id, hash })=> ui.send({ type: "focus-deployment-revision", id, hash }),
                onDeploymentSelect: ({ id })=> ui.send({ type: "focus-deployment-information", id }),
                onBack: ()=> ui.send({ type: "show_deployment_list" })
            }
        ), mainElement, );
    });