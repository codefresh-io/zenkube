import { compact } from "lodash";
import React from "react";

export default ({ id, destroy, name }, onClick = _.noop)=> React.createElement('span', {
    "onClick": onClick,
    "className": compact(["deployment-name", destroy && "inactive"]).join(' ')
}, name);