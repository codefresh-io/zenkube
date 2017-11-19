import _ from "lodash";
import React from "react";
import deploymentName from "./deployment_name";
import {
    MAIN_PAGE_DEPLOYMENT_LIST,
    MAIN_PAGE_DEPLOYMENT_INFO_VIEW,
    MAIN_PAGE_DEPLOYMENT_REVISION_VIEW
} from "../../control/constant";

const [header, span, button] = ["header", "span", "button"].map((name)=> _.partial(React.createElement, name));

export default (function(dictionary){
    return (uiState, deployments, onBack = _.noop)=>
        header(
            { key: "header" }, [],
            ..._.compact([(dictionary[uiState["main_page"]] || _.constant("N/A"))(uiState, deployments),
                uiState["main_page"] !== MAIN_PAGE_DEPLOYMENT_LIST && button({ onClick: onBack  }, ["Close"])]) //
        )
})({
    [MAIN_PAGE_DEPLOYMENT_LIST]: _.constant("Deployments Activity"),
    [MAIN_PAGE_DEPLOYMENT_INFO_VIEW]: ({ focused_deployment_id: id }, deployments)=> span({}, [], ...["Deployment \"", deploymentName(_.find(deployments, { id }), _.noop), `\"`]), //
    [MAIN_PAGE_DEPLOYMENT_REVISION_VIEW]: ({ focused_deployment_revision: r, focused_deployment_id: id }, deployments)=> span({}, [], ...["Revision ", r.toString(16), " of deployment \"", deploymentName(_(deployments).find({ id })), "\""])
});