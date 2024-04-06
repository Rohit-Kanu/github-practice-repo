import common from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import { GlobalVar } from '../../../../SAPAssetManager/Rules/Common/Library/GlobalCommon';
import MobileStatusSetReceivedObjectKey from '../../../../SAPAssetManager/Rules/MobileStatus/MobileStatusSetReceivedObjectKey';
import CurrentDateTime from '../../../../SAPAssetManager/Rules/DateTime/CurrentDateTime';
import Logger from '../../../../SAPAssetManager/Rules/Log/Logger';

/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function ZNotificationCreateSetDefaultStatus(context) {
	let promises = [];

	//TAQA(SSAM-E009) => Create the default "RECIEVED" status for local notification
	promises.push(MobileStatusSetReceivedObjectKey(context));

	return Promise.all(promises).then(results => {
		let mobileStatusParameter;
		let mobileStatusValue = '';
		let headerObject = {
			'OfflineOData.NonMergeable': true,
			'OfflineOData.TransactionID': results[0],
		};
		let mobileStatusLinks = [
			{
				'Property': 'NotifHeader_Nav',
				'Target': {
					'EntitySet': 'MyNotificationHeaders',
					'ReadLink': `MyNotificationHeaders('${common.getStateVariable(context, 'LocalId')}')`,
				},
			},
		];

		mobileStatusParameter = context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue();
		mobileStatusValue = common.getAppParam(context, 'MOBILESTATUS', mobileStatusParameter);
		mobileStatusLinks.push(
			{
				'Property': 'OverallStatusCfg_Nav',
				'Target': {
					'EntitySet': 'EAMOverallStatusConfigs',
					'ReadLink': `EAMOverallStatusConfigs(Status='NOTIFICATION: ${mobileStatusValue}', EAMOverallStatusProfile='')`,
				},
			},
		);

		let mobileStatusActionProperties = {
			'NotifNum': common.getStateVariable(context, 'LocalId'),
			'MobileStatus': mobileStatusValue,
			'ObjectType': GlobalVar.getAppParam().OBJECTTYPE.Notification,
			'ObjectKey': results[0],
			'EffectiveTimestamp': CurrentDateTime(context),
		};

		common.clearStateVariable(context, 'EMP');
		// EMPObject is undefined or null
		return context.executeAction({
			'Name': '/SAPAssetManager/Actions/MobileStatus/MobileStatusNotificationSetInitialStatus.action',
			'Properties': {
				'Properties': mobileStatusActionProperties,
				'CreateLinks': mobileStatusLinks,
				'Headers': headerObject,
			},
		}).catch(() => {
            Logger.error('Notification', err);
	});

});
}
