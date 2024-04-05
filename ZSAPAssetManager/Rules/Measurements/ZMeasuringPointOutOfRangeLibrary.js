/**
* Describe this function...
* @param {IClientAPI} clientAPI
*/
import notifCreate from '../Notifications/CreateUpdate/ZNotificationCreateForOutOfRangeMeasPt';
import libLocal from '../../../SAPAssetManager/Rules/Common/Library/LocalizationLibrary';
import libCom from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default class ZMeasuringPointOutOfRangeLibrary {

     //TAQA(SSAM-E009) => Check if enetered reading is within range or not
     static createNotification(pageClientAPI, HasReadingValue, readingVal, mpBinding) {
        let measuringPtbinding = mpBinding['@odata.type'] =="#sap_mobile.MeasurementDocument" ? mpBinding.MeasuringPoint : mpBinding;
        if (HasReadingValue) {
            let isLowerReadingValid = this.evalReadingGreaterThanEqualToLowerRange(pageClientAPI, readingVal, measuringPtbinding);
            let isUpperReadingValid = this.evalReadingLessThanEqualToUpperRange(pageClientAPI, readingVal, measuringPtbinding);
            measuringPtbinding.ZUserInputReadingVal = readingVal;
            libCom.setStateVariable(pageClientAPI, 'ZMeasuringPtObj', measuringPtbinding);
            if (isLowerReadingValid && isUpperReadingValid) {
                return Promise.resolve();
            } else {
                return notifCreate(pageClientAPI);
            }
        }
        return Promise.resolve();
    }

    static evalReadingGreaterThanEqualToLowerRange(pageClientAPI, reading, binding) {
        return (libLocal.toNumber(pageClientAPI, reading) >= libLocal.toNumber(pageClientAPI, binding.LowerRange));
    }
    static evalReadingLessThanEqualToUpperRange(pageClientAPI, reading, binding) {
        return (libLocal.toNumber(pageClientAPI, reading) <= libLocal.toNumber(pageClientAPI, binding.UpperRange));
    }

    //TAQA(SSAM-E009) => Generate long text for newly created out of range notification 
    static concatenatedNotes(pageClientAPI, measuringPtObj) {
        let arrNote = [];
        arrNote.push(pageClientAPI.localizeText('z_meas_reading_for_notes'));
       // arrNote.push(measuringPtObj.ZUserInputReadingVal);
       arrNote.push(measuringPtObj.Point);
        arrNote.push(' ');
        arrNote.push(pageClientAPI.localizeText('z_outside_range_limit'));
        arrNote.push(`${measuringPtObj.LowerRange} - ${measuringPtObj.UpperRange}`);
        //arrNote.push(pageClientAPI.localizeText('z_meas_doc'));
        let noteStr = arrNote.join('');
        return noteStr.toString();
    }
}