import _ from "lodash";
import moment from "moment";
import React from "react";
import roboHash from "./robohash";
import deploymentName from "./deployment_name";
import highlightString from "./highlight_string";

const [main, ul, li, i, a, div, span, time, header, input] = ["main", "ul", "li", "i", "a", "div", "span", "time", "header", "input"].map((name)=> _.partial(React.createElement, name));

export default (uiState, deployments, onRevisionSelect = _.noop, onDeploymentSelect = _.noop, onDeploymentFilter = _.noop)=> {
    let
        searchTerm = _.get(uiState, 'filter_deployment_name_active'),
        filteredDeployments = _(deployments)
            .map(({ id, name, revision, destroy, online })=> revision.map((rev)=> _.assign({ id, name, destroy, online }, rev)))
            .flatten()
            .sortBy('create')
            .reverse()
            .filter(searchTerm ? ({ name, hash })=> _.some([name, hash.toString(16)], _.partial(_.includes, _, searchTerm)) : _.constant(true))
            .map(({ id, create, hash, name, destroy, online })=> li(
                { key: [id, hash].join('-') }, [],
                div({ className: "deployment" }, [],
                    roboHash({ id }),
                    div({ className: "name" }, [],
                        deploymentName({ id, name, destroy }, _.partial(onDeploymentSelect, { id }), searchTerm),
                        " was committed a new change " ,
                        a({ onClick: _.partial(onRevisionSelect, { id, hash }) }, [], "#", ...highlightString(hash.toString(16), searchTerm))
                    ),
                    time({}, moment(create).fromNow())
                )
            ))
            .value();
    return main(
        { key: "main", className: "deployment-list" },
        [],
        ..._.compact([
            deployments.length && header({}, [], input({ type: "search", placeholder: "Deployment name or revision #", value: uiState["filter_field_value"], onChange: _.flow(_.property('target.value'), onDeploymentFilter) })),
            filteredDeployments.length ? ul(
                {},
                filteredDeployments
            ) : div({ className: "not-found" }, [], div({}, [], ..._.compact([deployments.length ? "nothing's found." : "there seems to be\nno deployments here yet.", deployments.length && ["\ntry to ", a({ onClick: _.partial(onDeploymentFilter, '') }, [], "clear the filter"), " to see additional deployments"]])))
        ])
    );
};