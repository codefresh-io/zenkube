import _ from "lodash";
import moment from "moment";
import React from "react";
import DeepDiff from "deep-diff";
import toReactYAML from "./react_yaml";

const [header, select, option, time, code, main] = ["header", "select", "option", "time", "code", "main"].map((name)=> _.partial(React.createElement, name));

export default ({ focused_deployment_id: id, focused_deployment_revision: revision }, deployments, onRevisionSelect = _.noop)=> {

    let
        currentDeployment = _.find(deployments, { id }),
        [currentRevision, prevRevision] = ((index)=> currentDeployment["revision"].slice(Math.max(index - 1 , 0), index + 1).reverse())(_(currentDeployment).chain().get('revision').findIndex({ hash: revision }).value());

    let diff = DeepDiff(...[prevRevision, currentRevision].map(_.flow((val)=> val || currentRevision, _.property('spec')))) || [];

    return main(
        { key: "main", className: "focus-deployment-revision" }, [],
        header({}, [],
            "Revision ",
            select(
                {
                    value: revision,
                    onChange: (e)=> onRevisionSelect({ id, hash: +e.target.value })
                },
                _(deployments).chain().find({ id }).get('revision', []).map(({ hash })=> option({ key: hash, value: hash }, hash.toString(16))).value()
            ),
            time({ className: "captured" }, ` from event captured ${moment(currentRevision["create"]).fromNow()}`)
        ),
        code({}, toReactYAML(_(currentRevision).chain().get('spec').value(), diff)) //diffRev
    );
};