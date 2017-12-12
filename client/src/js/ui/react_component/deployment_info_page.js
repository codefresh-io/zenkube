import _ from "lodash";
import React from "react";
import roboHash from "./robohash";
import formatDate from "../format_date";

const [main, header, h1, ul, li, code, span, div, table, tbody, td, tr, a] = ["main", "header", "h1", "ul", "li", "code", "span", "div", "table", "tbody", "td", "tr", "a"].map((name)=> _.partial(React.createElement, name));

export default (uiState, deployments, onRevisionSelect = _.noop)=> {
    let currentDeployment = _.find(deployments, { id: uiState["focused_deployment_id"] });

    if(!currentDeployment) return;

    return main({ key: "main", className: "deployment-information" }, [],

        h1({},[], 'Details'),
        ul({},[], ..._.compact([
            li({}, [],
                span({ className: "caption" }, [], "Name: "),
                span({ className: "value" }, [], currentDeployment["name"])
            ),
            li({}, [],
                span({ className: "caption" }, [], "ID: "),
                span({ className: "value" }, [], currentDeployment["id"])
            ),
            li({}, [],
                span({ className: "caption" }, [], "Created: "),
                span({ className: "value" }, [], formatDate(_.get(currentDeployment, 'create')))
            ),
            currentDeployment["destroy"] && li({}, [],
                span({ className: "caption" }, [], "Deleted: "),
                span({ className: "value" }, [], formatDate(_.get(currentDeployment, 'destroy')))
            ),
            li({}, [],
                span({ className: "caption" }, [], "Last Status: "),
                (function(online){ return span({ className: _.compact(["value", "online-status", online && "online"]).join(' ') }, [], online ? "Online" : "Offline"); })( _.get(currentDeployment, 'online'))
            ),
            li({}, [],
                span({ className: "caption" }, [], "Revisions: "),
                span({ className: "value" }, [], _.get(currentDeployment, 'revision', []).length)
            )
        ])),
        header({ className: "deployment-state-jumbo" }, [],
            roboHash({ className: "deployment-image", id: currentDeployment["id"], width: 128, height: 128 }),
            !currentDeployment["destroy"] && div({ className: "desired" }, currentDeployment["replica_desire"]),
            !currentDeployment["destroy"] && div({ className: _.compact(["current", currentDeployment["replica_current"] >= currentDeployment["replica_desire"] && "ok"]).join(' ') }, currentDeployment["replica_current"]),
            !currentDeployment["destroy"] && div({ className: _.compact(["available", currentDeployment["replica_available"] >= currentDeployment["replica_desire"] && "ok"]).join(' ') }, currentDeployment["replica_available"])
        ),
        h1({},[], 'Revisions'),
        table({}, [], tbody({},
            currentDeployment["revision"].map((revision)=>{
                return tr({ key: [currentDeployment["id"], revision["hash"]].join('-') }, [],
                    td({}, a({ onClick: _.partial(onRevisionSelect, { hash: +revision["hash"], id: currentDeployment["id"] }) }, revision["hash"].toString(16))),
                    td({}, formatDate(revision["create"])),
                )
            })
        )),
        h1({},[], 'Logs'),
        code({},[], ..._(currentDeployment["raw"]).map((entry)=>{
            return _.get(entry, 'event.object.status.conditions', []).map((o)=> _.assign({ timestamp: entry["timestamp"] }, o));
        }).flatten().map((condition)=>{
            return div({}, [],
                formatDate(condition["timestamp"]),
                " - ",
                _.at(condition, ["type", "status"]).join('='),
                " ",
                condition["reason"]
            );
        }))
    );
};