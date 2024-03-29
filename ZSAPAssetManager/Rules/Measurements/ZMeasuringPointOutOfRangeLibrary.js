/**
* Describe this function...
* @param {IClientAPI} clientAPI
*/
import notifCreate from '../Notifications/CreateUpdate/ZNotificationCreateForOutOfRangeMeasPt';
import empEnteries from '../../../SAPAssetManager/Rules/Notifications/EMP/CreateEMPEntries';
import libLocal from '../../../SAPAssetManager/Rules/Common/Library/LocalizationLibrary';

export default class ZMeasuringPointOutOfRangeLibrary {

    static createNotification(pageClientAPI, HasReadingValue, readingVal, binding) {
        if (HasReadingValue) {
            let isLowerReadingValid = this.evalReadingGreaterThanEqualToLowerRange(pageClientAPI, readingVal, binding);
            let isUpperReadingValid = this.evalReadingLessThanEqualToUpperRange(pageClientAPI, readingVal, binding);
            if (isLowerReadingValid && isUpperReadingValid) {
                return Promise.resolve();
            } else {
                ////(Rohit) => Notification creation with default value
                return notifCreate(pageClientAPI).then(() => {
                    return empEnteries(pageClientAPI);//(Rohit) => For emp entery and notif default status
                });
            }
        }
        return Promise.resolve();
    }
    
    //(Rohit) => Check value that is not lesser than lower range
    static evalReadingGreaterThanEqualToLowerRange(pageClientAPI, reading, binding) {
        return (libLocal.toNumber(pageClientAPI, reading) >= libLocal.toNumber(pageClientAPI, binding.LowerRange));
    }
    //(Rohit) => Check value that it is not greater than lower range
    static evalReadingLessThanEqualToUpperRange(pageClientAPI, reading, binding) {
        return (libLocal.toNumber(pageClientAPI, reading) <= libLocal.toNumber(pageClientAPI, binding.UpperRange));
    }

    static getEquipment(pageClientAPI){
        if(pageClientAPI.binding['@odata.type'] == '#sap_mobile.MyEquipment'){
            return pageClientAPI.binding.EquipId;
        }
        return '';
    }
    static getFunctionalLocation(pageClientAPI){
        if(pageClientAPI.binding['@odata.type'] == '#sap_mobile.MyEquipment' || pageClientAPI.binding['@odata.type'] == '#sap_mobile.MyFunctionalLocation'){
            return pageClientAPI.binding.FuncLocId;
        }
        return '';
    }
}