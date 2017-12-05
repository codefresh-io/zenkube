import _ from "lodash";
import React from "react";
import formatDate from "../format_date";

const [button, i, ul, li, time, span, input] = ["button", "i", "ul", "li", "time", "span", "input"].map((elementName)=> _.partial(React.createElement, elementName));

export default ({ focused_deployment_revision }, revisions, onRevisionSelect)=>
    ul({ className: "revision-selector" }, revisions.map(({ create, hash }, index)=>
        li(
            {
                key: index,
                className: focused_deployment_revision === hash ? "select" : undefined,
            }, [],
                button(
                    {
                        onClick: ()=> onRevisionSelect({ type: "focus-deployment-revision", hash })
                    }, [], ...[
                        span({}, hash.toString(16)),
                        time({}, formatDate(create)),
                        i()
                    ]
                )
            )
        )
    )