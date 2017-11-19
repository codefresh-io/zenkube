import _ from "lodash";
import moment from "moment";
import React from "react";
import roboHash from "./robohash";
import deploymentName from "./deployment_name";

const [main, ul, li, i, a, div, span, time] = ["main", "ul", "li", "i", "a", "div", "span", "time"].map((name)=> _.partial(React.createElement, name));

export default (uiState, deployments, onRevisionSelect = _.noop, onDeploymentSelect = _.noop)=>
    main(
        { key: "main", className: "deployment-list" },
        ul(
            {},
            _(deployments)
                .map(({ id, name, revision, destroy, online })=> revision.map((rev)=> _.assign({ id, name, destroy, online }, rev)))
                .flatten()
                .reverse()
                .value()
                .map(({ id, create, hash, name, destroy, online })=> li(
                    { key: [id, hash].join('-') }, [],
                    div({ className: "deployment" }, [],
                        roboHash({ id }),
                        div({ className: "name" }, [],
                            i({ title: online ? "Last status was OK" : "Last status failed or not available", className: _.compact(["deployment-status", online && "online"]).join(' ') }),
                            deploymentName({ id, name, destroy }, _.partial(onDeploymentSelect, { id })),
                            " was committed a new change " ,
                            a({ onClick: _.partial(onRevisionSelect, { id, hash }) }, [], ["#", hash.toString(16)])
                        ),
                        time({}, moment(create).fromNow())
                    )
                    )
                )
        )
    );