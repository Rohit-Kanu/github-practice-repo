import ComLib from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import GenerateNotificationID from '../../../../SAPAssetManager/Rules/Notifications/GenerateNotificationID';
import GetCurrentDate from '../../../../SAPAssetManager/Rules/Confirmations/BlankFinal/GetCurrentDate';
import notifClassConstant from '../../GlobalConstants/ZNotificationConstant';
import Logger from '../../../../SAPAssetManager/Rules/Log/Logger';
import measuringPtOutOfRangeLib from '../../../Rules/Measurements/ZMeasuringPointOutOfRangeLibrary';

export default function ZNotificationCreateForOutOfRangeMeasPt(clientAPI) {

    //TAQA(SSAM-E009) => Store the required field for notif(out of range) & create a local notif on device
    let measuringPtObj = ComLib.getStateVariable(clientAPI, 'ZMeasuringPtObj');
    let equipmentObj = ComLib.isDefined(measuringPtObj.Equipment) ? measuringPtObj.Equipment : '';
    let funcLocObj = ComLib.isDefined(measuringPtObj.FunctionalLocation) ? measuringPtObj.FunctionalLocation : '';
    let technicalObj = ComLib.isDefined(equipmentObj) ? equipmentObj : funcLocObj;
    let type = notifClassConstant.defaultType;
    let descr = `${notifClassConstant.MP} ${measuringPtObj.Point} ${notifClassConstant.measurementReading} ${measuringPtObj.ZUserInputReadingVal}`;
    let note = measuringPtOutOfRangeLib.concatenatedNotes(clientAPI,measuringPtObj);

    ComLib.setStateVariable(clientAPI, 'NotificationType', type); // Saving type to later use for EAMOverallStatusConfigs
    ComLib.setStateVariable(clientAPI, 'ObjectCreatedName', 'Notification');

    return GenerateNotificationID(clientAPI).then((notif) => {
        let notifNum = notif;
        let notificationCreateProperties = {
            'PlanningGroup': technicalObj.PlannerGroup,
            'PlanningPlant': technicalObj.PlanningPlant,
            'NotificationNumber': notifNum,
            'NotificationDescription': descr,
            'NotificationType': type,
            'Priority': notifClassConstant.highPriority,
            'HeaderFunctionLocation': technicalObj.FuncLocId,
            'HeaderEquipment': technicalObj.EquipId,
            'BreakdownIndicator': false,
            'MainWorkCenter': technicalObj.MaintWorkCenter,
            'MainWorkCenterPlant': technicalObj.MaintPlant,
            'ReportedBy': ComLib.getSapUserName(clientAPI),
            'CreationDate': GetCurrentDate(clientAPI),
            'ReferenceNumber': "",
            'RefObjectKey': "",
            'RefObjectType': "",
        };

        return clientAPI.executeAction({
            'Name': '/ZSAPAssetManager/Actions/Notifications/CreateUpdate/ZNotificationCreateForOutOfRangeMeasPt.action',
            'Properties': {
                'Properties': notificationCreateProperties,
                'Headers':
                {
                    'OfflineOData.RemoveAfterUpload': 'true',
                    'OfflineOData.TransactionID': notifNum,
                },
            },
        }).then(actionResult => {
            // Store created notification
            ComLib.setStateVariable(clientAPI, 'CreateNotification', JSON.parse(actionResult.data));
            ComLib.setStateVariable(clientAPI, 'ZNotifNotes', note);
            // //TAQA(SSAM-E009) => Create note for newly added local notification
            return clientAPI.executeAction('/ZSAPAssetManager/Actions/Notes/Notifications/ZNoteCreateForMeasPtOutOfRangeNotification.action');
        }).catch(() => {
            Logger.error('Notification', err);
            clientAPI.dismissActivityIndicator();
            return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
        });
    }).catch(err => {
        Logger.error('Notification', err);
        clientAPI.dismissActivityIndicator();
        return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
    });
}