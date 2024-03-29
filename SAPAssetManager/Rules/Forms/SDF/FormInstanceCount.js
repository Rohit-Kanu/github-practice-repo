import FormInstanceListQueryOptions from './FormInstanceListQueryOptions';
/**
 * 
 * @param {IClientAPI} clientAPI 
 * @returns {Promise<number>}
 */
export default function FormInstanceCount(clientAPI) {
    const pageProxy = clientAPI.getPageProxy();
    const queryOptions = FormInstanceListQueryOptions(pageProxy, true);
    
    return clientAPI.count('/SAPAssetManager/Services/AssetManager.service', `${pageProxy.binding['@odata.readLink']}/DynamicFormInstance_Nav`, queryOptions);
}
