import libPoint from '../../../../SAPAssetManager/Rules/Measurements/MeasuringPointLibrary';
import Logger from '../../../../SAPAssetManager/Rules/Log/Logger';
import GenerateLocalID from '../../../../SAPAssetManager/Rules/Common/GenerateLocalID';
import readingValue from '../../../../SAPAssetManager/Rules/Measurements/Document/MeasurementDocumentReadingValue';
import hasReading from '../../../../SAPAssetManager/Rules/Measurements/Document/MeasurementDocumentHasReadingValue';
import measuringPtOutOfRangeLib from '../ZMeasuringPointOutOfRangeLibrary';

export default function MeasurementDocumentCreateUpdateFinalizeData(pageClientAPI) {
    //if in update, run update action else run create action
    /**Implementing our Logger class*/
    Logger.debug(pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMeasurementDocuments.global').getValue(), 'Starting MeasurementDocumentCreateUpdateFinalizeData');
    let HasReadingValue = hasReading(pageClientAPI);
    let readingVal = HasReadingValue ? readingValue(pageClientAPI) : '';
    if (libPoint.evalIsUpdateTransaction(pageClientAPI)) {
        pageClientAPI.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentUpdate.action').then(() => {
            //(Rohit) => Check if Reading is out of range then trigger Notification
          return measuringPtOutOfRangeLib.createNotification(pageClientAPI, HasReadingValue, readingVal, pageClientAPI.binding);
        });
    } else {
        return GenerateLocalID(pageClientAPI, 'MeasurementDocuments', 'MeasurementDocNum', '000000000000', "$filter=startswith(MeasurementDocNum, 'LOCAL') eq true", 'LOCAL_M', 'SortField').then(localID => {
            pageClientAPI.binding.LocalID = localID;
            pageClientAPI.setActionBinding(pageClientAPI.binding);
            return pageClientAPI.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentCreate.action').then(() => {
                //(Rohit) => Check if Reading is out of range then trigger Notification
                return measuringPtOutOfRangeLib.createNotification(pageClientAPI, HasReadingValue, readingVal, pageClientAPI.binding);
            })
        });
    }
    /**Implementing our Logger class*/
    Logger.debug(pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryMeasurementDocuments.global').getValue(), 'Finishing MeasurementDocumentCreateUpdateFinalizeData');

}
