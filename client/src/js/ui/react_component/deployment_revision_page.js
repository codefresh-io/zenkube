import _ from "lodash";
import moment from "moment";
import React from "react";
import DeepDiff from "deep-diff";
import deploymentRevisionSelector from "./deployment_revision_selector";
import toReactYAML from "./react_yaml";

const [header, select, option, time, code, main, div] = ["header", "select", "option", "time", "code", "main", "div"].map((name)=> _.partial(React.createElement, name));

export default (uiStateObj, deployments, onRevisionSelect = _.noop)=> {

    const
        { focused_deployment_id: id, focused_deployment_revision: revision } = uiStateObj,
        currentDeployment = _.find(deployments, { id }),
        [currentRevision, prevRevision] = ((index)=> currentDeployment["revision"].slice(Math.max(index - 1 , 0), index + 1).reverse())(_(currentDeployment).chain().get('revision').findIndex({ hash: revision }).value());

    let diff = DeepDiff(...[prevRevision, currentRevision].map(_.flow((val)=> val || currentRevision, _.property('spec')))) || [];

    return main(
        { key: "main", className: "focus-deployment-revision" }, [],
        div({ className: "pane" }, [], ...[
            deploymentRevisionSelector(uiStateObj, currentDeployment["revision"], onRevisionSelect),
            code({}, toReactYAML(_(currentRevision).chain().get('spec').value(), diff)) //diffRev
        ])
    );
};