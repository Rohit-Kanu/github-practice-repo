import FilterLibrary from '../../../Filter/FilterLibrary';

/** @param {IPageProxy} context */
export default function ServiceRequestListFilterResults(context) {
    const fcContainer = context.getControls().find(c => c.getType() === 'Control.Type.FormCellContainer');
    const [sortFilter, mobileStatusFilter, priorityFilter] = ['SortFilter', 'MobileStatusFilter', 'PriorityFilter'].map(n => fcContainer.getControl(n).getValue());
    let filterCriterias = [sortFilter, mobileStatusFilter, priorityFilter];

    const [reqDatetart, reqDateEnd, reqDateVisibleSwitch] = ['ReqStartDateFilter', 'ReqEndDateFilter', 'RequestStartDateSwitch'].map(n => fcContainer.getControl(n));
    filterCriterias.push(FilterLibrary.getDateIntervalFilterCriteria(context, reqDatetart, reqDateEnd, reqDateVisibleSwitch, 'RequestedStart'));

    const [dueDatetart, dueDateEnd, dueDateVisibleSwitch] = ['DueStartDateFilter', 'DueEndDateFilter', 'DueDateSwitch'].map(n => fcContainer.getControl(n));
    filterCriterias.push(FilterLibrary.getDateIntervalFilterCriteria(context, dueDatetart, dueDateEnd, dueDateVisibleSwitch, 'DueBy'));

    /** @type {import('../../ServiceRequests/ServiceRequestsFastFiltersItems').ServiceRequestsListPageClientData} */
    const clientData = context.evaluateTargetPath('#Page:ServiceRequestsListViewPage/#ClientData');

    filterCriterias = filterCriterias.concat(clientData.serviceRequestsFastFilters.getFastFilterValuesFromFilterPage(context, mobileStatusFilter.filterItems));
    return filterCriterias.filter(c => !!c); // filter out the undefined criterias
}
