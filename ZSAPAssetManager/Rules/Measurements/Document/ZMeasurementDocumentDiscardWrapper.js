import discard from '../../../../SAPAssetManager/Rules/Common/DiscardAction';
import notifClassConstant from '../../GlobalConstants/ZNotificationConstant';
import libCom from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import measPtLib from '../ZMeasuringPointOutOfRangeLibrary';

export default async function ZMeasurementDocumentDiscardWrapper(context){
    //TAQA(SSAM-E009) => Discard local meas document and then associated local notification
    let measDocObj = context.binding;
    let pt = measDocObj.Point;
    let reading = measDocObj.ReadingValue;
    let desc= `${notifClassConstant.MP} ${pt} ${notifClassConstant.measurementReading} ${reading}`;
    let query = `$filter=sap.islocal() and NotificationDescription eq '${desc}'`;
    let notification = await context.read('/SAPAssetManager/Services/AssetManager.service', 'MyNotificationHeaders', [], query);
    return discard(context).then((result)=>{
        if(libCom.isDefined(result) && notification.length > 0){
       context.binding.ZNotifReadLink = notification.getItem(0)['@odata.id'];
       context.binding.ZNotificationNumber = notification.getItem(0).NotificationNumber;
        return context.executeAction('/ZSAPAssetManager/Actions/Notifications/CreateUpdate/ZMeasPtAssociatedNotificationDiscard.action');
        }
    });
}
