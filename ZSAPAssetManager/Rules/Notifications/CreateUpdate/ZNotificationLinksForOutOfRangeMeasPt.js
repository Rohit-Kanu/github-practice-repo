import common from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import notifClassConstant from '../../GlobalConstants/ZNotificationConstant';
import measuringPtOutOfRangeLib from '../../Measurements/ZMeasuringPointOutOfRangeLibrary';

export default function ZNotificationLinksForOutOfRangeMeasPt(context) {
    //TAQA(SSAM-E009) => Notification link to be generated for newly create notification
    const notificationType = notifClassConstant.defaultType;

    return context.read('/SAPAssetManager/Services/AssetManager.service', 'NotificationTypes', [], `$filter=NotifType eq '${notificationType}'`).then(function(data) {
        const priorityType = data.getItem(0).PriorityType;

        return createNotificationLinks(context, priorityType);
    });
}

function createNotificationLinks(context, priorityType) {
    let binding = context.getBindingObject();
    if (binding.selectedOperations) {
        binding = context.getActionBinding();
        for (const [key, value] of Object.entries(binding)) {
            binding[key] = value;
        }
    }
    var links = [{
        'Property': 'NotifPriority',
        'Target':
        {
            'EntitySet': 'Priorities',
            'ReadLink': `Priorities(PriorityType='${priorityType}',Priority='2')`,
        },
    }];
    let measuringPtObj = common.getStateVariable(context, 'ZMeasuringPtObj').Equipment;
    var flocValue = measuringPtObj.FuncLocId;
    var equipmentValue = measuringPtObj.EquipId;
    
    if (common.isDefined(flocValue) && !common.isCurrentReadLinkLocal(flocValue)) {
        links.push({
            'Property': 'FunctionalLocation',
            'Target':
            {
                'EntitySet': 'MyFunctionalLocations',
                'ReadLink': `MyFunctionalLocations('${flocValue}')`,
            },
        });
    }

    if (common.isDefined(equipmentValue) && !common.isCurrentReadLinkLocal(equipmentValue)) {
        links.push({
            'Property': 'Equipment',
            'Target':
            {
                'EntitySet': 'MyEquipments',
                'ReadLink': `MyEquipments('${equipmentValue}')`,
            },
        });
    }
    return links;
}
