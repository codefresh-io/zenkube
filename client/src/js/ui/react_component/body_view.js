import pageHeader from "./page_header";
import deploymentListPage from "./deployment_list_page";
import deploymentRevisionPage from "./deployment_revision_page";
import deploymentInfoPage from "./deployment_info_page";
import offlinePage from "./offline";

import {
    MAIN_PAGE_DEPLOYMENT_LIST,
    MAIN_PAGE_DEPLOYMENT_REVISION_VIEW,
    MAIN_PAGE_DEPLOYMENT_INFO_VIEW
} from "../../control/constant";

export default function(uiState, deployments, {
    onRevisionSelect = _.noop,
    onDeploymentSelect = _.noop,
    onBack = _.noop
}){
    if(!uiState["online"]){
        return offlinePage();
    } else {
        return [
            pageHeader(uiState, deployments, onBack, onDeploymentSelect),
            (function(){
                switch (uiState["main_page"]){
                    case MAIN_PAGE_DEPLOYMENT_LIST:
                        return deploymentListPage(uiState, deployments, onRevisionSelect, onDeploymentSelect);
                        break;
                    case MAIN_PAGE_DEPLOYMENT_REVISION_VIEW:
                        return deploymentRevisionPage(uiState, deployments, onRevisionSelect);
                        break;
                    case MAIN_PAGE_DEPLOYMENT_INFO_VIEW:
                        return deploymentInfoPage(uiState, deployments, onRevisionSelect);
                        break;
                }
            })()
        ];
    }
};