import { compact } from "lodash";
import React from "react";
import highlightString from "./highlight_string";

export default ({ id, destroy, name }, onClick = _.noop, searchTerm)=>
    React.createElement('span',
        {
            "onClick": onClick,
            "className": compact(["deployment-name", destroy && "inactive"]).join(' ')
        },
        [],
        ...highlightString(name, searchTerm)
    );
