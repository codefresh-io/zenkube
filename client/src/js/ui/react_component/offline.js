import _ from "lodash";
import React from "react";

const [div, h1, p] = ["div", "h1", "p"].map((elementName)=> _.partial(React.createElement, elementName));

export default function(){
    return div({ className: "offline" }, [], ...[
        h1({}, "0011011001011010001001010  10   0    1     0       1"),
        ..."aw-shucks! ..it's looks like we've lost connection to the server.\nstand by. no need to refresh, we'll resume as soon as we regain connection.".split('\n').map(_.unary(_.partial(p, {})))
    ]);
};