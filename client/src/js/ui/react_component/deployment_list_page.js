import _ from "lodash";
import moment from "moment";
import React from "react";
import roboHash from "./robohash";
import deploymentName from "./deployment_name";

const [main, ul, li, i, a, div, span, time, header, input] = ["main", "ul", "li", "i", "a", "div", "span", "time", "header", "input"].map((name)=> _.partial(React.createElement, name));

export default (uiState, deployments, onRevisionSelect = _.noop, onDeploymentSelect = _.noop, onDeploymentFilter = _.noop)=> {
    let searchTerm = _.get(uiState, 'filter_deployment_name_active');
    return main(
        { key: "main", className: "deployment-list" },
        [],
        header({}, [], input({ type: "search", placeholder: "Search deployment", value: uiState["filter_deployment_name"], onChange: _.flow(_.property('target.value'), _.trim, _.toLower, onDeploymentFilter) })),
        ul(
            {},
            _(deployments)
                .map(({ id, name, revision, destroy, online })=> revision.map((rev)=> _.assign({ id, name, destroy, online }, rev)))
                .flatten()
                .sortBy('create')
                .reverse()
                .filter(searchTerm ? _.flow(_.property('name'), _.partial(_.includes, _, searchTerm)) : _.constant(true))
                .map(({ id, create, hash, name, destroy, online })=> li(
                    { key: [id, hash].join('-') }, [],
                    div({ className: "deployment" }, [],
                        roboHash({ id }),
                        div({ className: "name" }, [],
                            deploymentName({ id, name, destroy }, _.partial(onDeploymentSelect, { id }), searchTerm),
                            " was committed a new change " ,
                            a({ onClick: _.partial(onRevisionSelect, { id, hash }) }, [], ["#", hash.toString(16)])
                        ),
                        time({}, moment(create).fromNow())
                    )
                ))
                .value()
        )
    );
};