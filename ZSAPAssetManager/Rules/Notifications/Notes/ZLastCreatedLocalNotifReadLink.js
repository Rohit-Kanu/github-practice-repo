/**
* Describe this function...
* @param {IClientAPI} clientAPI
*/
export default async function ZLastCreatedLocalNotifReadLink(clientAPI) {
    let query = "$orderby=NotificationNumber desc&$top=1"
    return clientAPI.read('/SAPAssetManager/Services/AssetManager.service', 'MyNotificationHeaders', [], query).then((result)=>{
        let readLink = result.getItem(0);
        return readLink['@odata.readLink'];
    })
}