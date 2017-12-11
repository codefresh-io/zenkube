import React from "react";
import _ from "lodash";

const
    escapeRegEx = function(s) { return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); },
    span = _.partial(React.createElement, 'span');

export default function(str, highlightedStr){
    return highlightedStr ? ((regExp)=> _.compact(_.flatten(_.zip(str.split(regExp), _.toArray(str.match(regExp)).map(_.unary(_.partial(span, { className: "highlight" })))))))(new RegExp(escapeRegEx(highlightedStr), 'ig')) : str;
};