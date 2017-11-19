import _ from "lodash";
import React from "react";

const [ div, span ] = ["div", "span"].map((elementName)=> _.partial(React.createElement, elementName));

const detectChange = (obj, diff, path)=>{
    return { diff, path, obj, change: _.filter(diff, ({ kind, path: changePath })=> _.isEqual(changePath, path) && kind === "E") }
};

const toReactYAML = (function(){
    const formatters = [
        { test: (obj)=> ["number", "string"].some((typeName)=> typeof(obj) === typeName), format: _.flow(detectChange, ({ obj, change })=> {
            return span({ className: _.compact(["value", !_.isEmpty(change) && "change"]).join(' ') }, [], JSON.stringify(obj));
        }) },
        { test: (obj)=> obj === null, format: _.flow(detectChange, ({ obj, change })=> span({ className: _.compact(["value", !_.isEmpty(change) && "change"]).join(' ') }, [], "~")) },
        { test: _.isEmpty, format: _.flow(detectChange, ({ obj, change })=> span({ className: _.compact(["value", !_.isEmpty(change) && "change"]) }, [], "{}")) },
        {
            test: ()=> true,
            format: (obj, diff, path)=> {
                let changeSet = _(diff).filter(({ path: changePath })=> _.isEqual(changePath.slice(0, -1), path)).groupBy(({ path })=> path.join('.')).mapValues(_.flow(_.first, _.property('kind'))).value();
                return div({}, [], ...Object
                    .keys(obj)
                    .map((keyName)=> {
                        let value = obj[keyName];
                        return div({}, [], ..._.flatten([
                            Array.isArray(obj) ? span({ className: "value" }, [], "- ") : [span({ className: _.compact(["key", changeSet[keyName] === "N" && "new"]).join(' ') }, [], keyName), span({ className: "value"}, [], ": ")],
                            toReactYAML(value, diff, path.concat([keyName]))
                        ]));
                    })
                );
            }
        }
    ];

    return (obj, diff = [], path = [])=>{
        return formatters.find(({test}) => test(obj))["format"](obj, diff, path);
    }
})();

export { toReactYAML as default };