import ComLib from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import valLib from '../../../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';
import Logger from '../../../../SAPAssetManager/Rules/Log/Logger';
import GenerateNotificationID from '../../../../SAPAssetManager/Rules/Notifications/GenerateNotificationID';
import NotificationLibrary from '../../../../SAPAssetManager/Rules/Notifications/NotificationLibrary';
import GetMalfunctionStartDate from '../../../../SAPAssetManager/Rules/Notifications/MalfunctionStartDate';
import GetMalfunctionStartTime from '../../../../SAPAssetManager/Rules/Notifications/MalfunctionStartTime';
import GetMalfunctionEndDate from '../../../../SAPAssetManager/Rules/Notifications/MalfunctionEndDate';
import GetMalfunctionEndTime from '../../../../SAPAssetManager/Rules/Notifications/MalfunctionEndTime';
import GetCurrentDate from '../../../../SAPAssetManager/Rules/Confirmations/BlankFinal/GetCurrentDate';
import notifClassConstant from '../../GlobalConstants/ZNotificationConstant';
import measuringPtOutOfRangeLib from '../../Measurements/ZMeasuringPointOutOfRangeLibrary';

export default function ZNotificationCreateForOutOfRangeMeasPt(clientAPI) {

    let plannerGroup = '';
    let breakdownStart = '';
    let breakdownEnd = '';
    let type = notifClassConstant.defaultType;
    ComLib.setStateVariable(clientAPI, 'NotificationType', type); // Saving type to later use for EAMOverallStatusConfigs
    let descr = notifClassConstant.defaultDescription;
    let notifCategoryPromise = NotificationLibrary.getNotificationCategory(clientAPI, type).then(notifCategory => {
        ComLib.setStateVariable(clientAPI, 'NotificationCategory', notifCategory);
        return notifCategory;
    });

        ComLib.setStateVariable(clientAPI, 'ObjectCreatedName', 'Notification');
        if (!valLib.evalIsEmpty(type) && !valLib.evalIsEmpty(descr)) {
            let promises = [];
            promises.push(GenerateNotificationID(clientAPI));
           //promises.push(NotificationLibrary.NotificationCreateMainWorkCenter(clientAPI));
            promises.push(notifCategoryPromise);
            
            return Promise.all(promises).then(results => {
                let notifNum = results[0];
                //let workcenter = results[1];
               // let floc = results[2];
               // let equip = results[3];

                let notificationCreateProperties = {
                    'PlanningGroup': '',
                    'PlanningPlant': NotificationLibrary.NotificationCreateDefaultPlant(clientAPI),
                    'NotificationNumber': notifNum,
                    'NotificationDescription': descr,
                    'NotificationType': type,
                    'Priority': notifClassConstant.veryHighPriority,
                    'HeaderFunctionLocation': measuringPtOutOfRangeLib.getFunctionalLocation(clientAPI),
                    'HeaderEquipment': measuringPtOutOfRangeLib.getEquipment(clientAPI),
                    'BreakdownIndicator': true,
                    'MainWorkCenter': '',
                    'MainWorkCenterPlant': NotificationLibrary.NotificationCreateMainWorkCenterPlant(clientAPI),
                    'ReportedBy': ComLib.getSapUserName(clientAPI),
                    'CreationDate': GetCurrentDate(clientAPI),
                    'ReferenceNumber': '',
                    'RefObjectKey': '',
                    'RefObjectType': '',
                };

                if (breakdownStart) {
                    notificationCreateProperties.MalfunctionStartDate = GetMalfunctionStartDate(clientAPI);
                    notificationCreateProperties.MalfunctionStartTime = GetMalfunctionStartTime(clientAPI);
                }

                if (breakdownEnd) {
                    notificationCreateProperties.MalfunctionEndDate = GetMalfunctionEndDate(clientAPI);
                    notificationCreateProperties.MalfunctionEndTime = GetMalfunctionEndTime(clientAPI);
                }

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
                }).catch(() => {
                    clientAPI.dismissActivityIndicator();
                    return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
                });
            }).catch(err => {
                Logger.error('Notification', err);
                clientAPI.dismissActivityIndicator();
                return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
            });

        } else {
            clientAPI.dismissActivityIndicator();
            Logger.error(clientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryNotifications.global').getValue(), 'One of the required controls did not return a value OnCreate');
            return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
        }
    }
