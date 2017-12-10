import { compact } from "lodash";
import React from "react";

const escapeRegEx = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export default ({ id, destroy, name }, onClick = _.noop, searchTerm)=>
    React.createElement('span', {
        "onClick": onClick,
        "className": compact(["deployment-name", destroy && "inactive"]).join(' '),
        "dangerouslySetInnerHTML": { __html: searchTerm ? name.replace(new RegExp(escapeRegEx(searchTerm), 'ig'), '<span>$&</span>') : name }
    });
