import libPoint from '../../../../SAPAssetManager/Rules/Measurements/MeasuringPointLibrary';
import Logger from '../../../../SAPAssetManager/Rules/Log/Logger';
import GenerateLocalID from '../../../../SAPAssetManager/Rules/Common/GenerateLocalID';
import readingValue from '../../../../SAPAssetManager/Rules/Measurements/Document/MeasurementDocumentReadingValue';
import hasReading from '../../../../SAPAssetManager/Rules/Measurements/Document/MeasurementDocumentHasReadingValue';
import measuringPtOutOfRangeLib from '../ZMeasuringPointOutOfRangeLibrary';
import libCom from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function MeasurementDocumentCreateUpdateFinalizeData(pageClientAPI) {
    //if in update, run update action else run create action
    /**Implementing our Logger class*/
    let measDocObj = {};
    if(pageClientAPI.binding['@odata.type'] == "#sap_mobile.MeasurementDocument"){
    measDocObj.Point = pageClientAPI.binding.Point;
    measDocObj.RecordedValue = (pageClientAPI.binding.ReadingValue).toString();
    measDocObj['@odata.type'] = pageClientAPI.binding['@odata.type'];
    }
    
    Logger.debug(pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMeasurementDocuments.global').getValue(), 'Starting MeasurementDocumentCreateUpdateFinalizeData');
    let HasReadingValue = hasReading(pageClientAPI);
    let readingVal = HasReadingValue ? readingValue(pageClientAPI) : '';
    libCom.setStateVariable(pageClientAPI,'ZMeasDocObjToUpd', measDocObj);
    if (libPoint.evalIsUpdateTransaction(pageClientAPI)) {
        //TAQA(SSAM-E009) => First update the meas doc & post that check if entered reading is within range or not
        pageClientAPI.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentUpdate.action').then(() => {
          return measuringPtOutOfRangeLib.createNotification(pageClientAPI, HasReadingValue, readingVal, pageClientAPI.binding).then(()=>{
            //TAQA(SSAM-E009) =>Delete notification for which the associated meas doc does not exist
            return measuringPtOutOfRangeLib.checkUpdatedMeasDocAssociatedNotif(pageClientAPI);
          });
        });
    } else {
        return GenerateLocalID(pageClientAPI, 'MeasurementDocuments', 'MeasurementDocNum', '000000000000', "$filter=startswith(MeasurementDocNum, 'LOCAL') eq true", 'LOCAL_M', 'SortField').then(localID => {
            pageClientAPI.binding.LocalID = localID;
            pageClientAPI.setActionBinding(pageClientAPI.binding);
             //TAQA(SSAM-E009) => First generate the meas doc & post that check if entered reading is within range or not
            return pageClientAPI.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentCreate.action').then(() => {
                return measuringPtOutOfRangeLib.createNotification(pageClientAPI, HasReadingValue, readingVal, pageClientAPI.binding);
            })
        });
    }
    /**Implementing our Logger class*/
    Logger.debug(pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMeasurementDocuments.global').getValue(), 'Finishing MeasurementDocumentCreateUpdateFinalizeData');

}