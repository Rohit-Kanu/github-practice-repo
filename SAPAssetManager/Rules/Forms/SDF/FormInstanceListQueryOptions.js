import QueryBuilder from '../../Common/Query/QueryBuilder';
/**
 * 
 * @param {IClientAPI} clientAPI 
 * @param {boolean} countOnly set to true to remove the $top and $select for use in $count
 * @returns {string}
 */
export default function FormInstanceListQueryOptions(clientAPI, countOnly = false) {
    const pageName = clientAPI.evaluateTargetPathForAPI('#Page:-Current')._page.id;

    const queryBuilder = new QueryBuilder(
        [], // filters
        [], // expands
        ['AppName','FormName','FormVersion','FormInstanceID','FormStatus','Mandatory'], // selects
        [], // extras
    );

    // for sections
    if (pageName !== 'FormListViewPage' && !countOnly) {
        queryBuilder.addExtra('top=2');
    }

    if (countOnly) {
        queryBuilder.selects.length = 0;
    }

    return queryBuilder.build();
}
