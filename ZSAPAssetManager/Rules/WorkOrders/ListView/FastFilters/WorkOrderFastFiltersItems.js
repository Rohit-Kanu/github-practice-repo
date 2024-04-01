import WOFastFilters from '../../../../../SAPAssetManager/Rules/FastFilters/MultiPersonaFilters/WOFastFilters';
import libCom from '../../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function WorkOrderFastFiltersItems(context) {
    let WOFastFiltersClass = new WOFastFilters(context);

    return prepareDataForFastFilters(context, WOFastFiltersClass).then(() => {

        /** 
            to customize the list of fast filters, the getFastFilters method must be overwritten in the WOFastFilters class
            getFastFilters returns a list of filter objects
            each object contains:
            for filters: filter name, filter value, filter property (if the value is not a complex query), filter group (combines multiple filters with "or"), visible
            for sortes: caption, value, visible
         */

            //(Rohit) => Changes to handle the due date should only the date instead of date & time
            let oFilterArr = context.filters;
            let dueDateChangedLbl = '';
            oFilterArr.forEach(item => {
                if(item._label == 'Due Date'){
                    let dueDateLabel = item._filterItemsDisplayValue[0];
                    if(libCom.isDefined(dueDateLabel) && (dueDateLabel.includes('AM') || dueDateLabel.includes('PM'))){
                        dueDateChangedLbl = getFilterStartAndEndDate(dueDateLabel);
                        item._filterItemsDisplayValue[0] = dueDateChangedLbl;
                    }
                }
            });
        return WOFastFiltersClass.getFastFilterItemsForListPage(context);
    });
}

function prepareDataForFastFilters(context, WOFastFiltersClass) {
    let promises = [];

    promises.push(context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaderLongTexts', ['OrderId'], '$filter=sap.hasPendingChanges()'));
    promises.push(context.read('/SAPAssetManager/Services/AssetManager.service', 'PMMobileStatuses', ['OrderId'], '$filter=sap.hasPendingChanges() and sap.entityexists(WOHeader_Nav)'));

    return Promise.all(promises).then(results => {
        let ids = [];

        if (results[0].length) {
            results[0].forEach(result => {
                if (result.OrderId) {
                    ids.push(`OrderId eq '${result.OrderId}'`);
                }
            });
        }

        if (results[1].length) {
            results[1].forEach(result => {
                if (result.OrderId) {
                    ids.push(`OrderId eq '${result.OrderId}'`);
                }
            });
        }

        context.getPageProxy().getClientData().WOFastFiltersClass = WOFastFiltersClass;

        if (ids.length) {
            let query = ids.join(' or ');
            WOFastFiltersClass.setConfigProperty('modifiedFilterQuery', query);
        }

        return Promise.resolve();
    });
}

//Extract the Due Start date & end date from a string with date time value
function getFilterStartAndEndDate(filterStr){
    let arrStrResult = [];
    let firstCommaValueIdx = filterStr.indexOf(',');
    let hyphenSepratedValueIndex = filterStr.indexOf('-');
    let unformattedEndDate = filterStr.substr(hyphenSepratedValueIndex + 1,filterStr.length);
    let secondCommmaValueIdx = unformattedEndDate.indexOf(',');

    arrStrResult.push(filterStr.substring(0,firstCommaValueIdx));//Get the start date & month
    arrStrResult.push(filterStr.substring(firstCommaValueIdx + 1, firstCommaValueIdx + 6));//Get the start date year

    arrStrResult.push(" - ");

    arrStrResult.push(unformattedEndDate.substring(0,secondCommmaValueIdx));//Get the end date & month
    arrStrResult.push(unformattedEndDate.substring(secondCommmaValueIdx + 1, secondCommmaValueIdx + 6));//Get the end date year

    let strDateArr = arrStrResult.toString();
    return strDateArr.replaceAll(',', ' ');
}
