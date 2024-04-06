export default function MeasuringPointQuery(context) {
    let pageProxy = context.getPageProxy();
    let binding = pageProxy.binding;
    //TAQA(SSAM-E009) => Added Equipment,FunctionalLocation in expand for measuring pt
    let query = "$filter=Point eq '" + binding.Point + "'&$expand=Equipment,FunctionalLocation,MeasurementDocs,MeasurementDocs/MeasuringPoint&$select=*,MeasurementDocs/ReadingDate,MeasurementDocs/ReadingTimestamp,MeasurementDocs/ReadingTime,MeasurementDocs/ReadingValue,MeasurementDocs/IsCounterReading,MeasurementDocs/CounterReadingDifference,MeasurementDocs/MeasurementDocNum";
    return query;
}
