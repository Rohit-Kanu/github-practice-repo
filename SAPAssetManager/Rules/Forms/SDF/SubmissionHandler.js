
import Logger from '../../Log/Logger';

export default function SubmissionHandler(context) {
    Logger.debug('SubmissionHandler started');
    const clientData = context.evaluateTargetPath('#Page:FormRunner/#ClientData');

    const communicationType = context.binding['communication-type'];
    const load = context.binding.load;
    const data = context.binding.data;
    const status = context.binding.status;
    const initialStatus = (clientData && clientData.FormData && clientData.FormData.PreviousStatus) ? clientData.FormData.PreviousStatus : context.binding.initialStatus;
    const source = context.binding.source;
    const isNew = context.binding.new;
    const appName = context.binding.applicationName;
    const formName = context.binding.formName;
    const formVersion = context.binding.formVersion;


    Logger.debug(`SubmissionHandler found ${communicationType} ${load} ${data.length} bytes, ${status}, ${initialStatus}, ${source}, ${isNew}, ${appName}, ${formName}, ${formVersion}`);

    Logger.debug('DEBUG',JSON.stringify(context.binding));

    if ((communicationType === 'post') && (load === 'formdata')) {

        
        const formData = {
            Data: data,
            Status: status || 'New',
            NonMergable: status === initialStatus,
            PreviousStatus: initialStatus,
        };

        clientData.FormData = formData;
        const pageProxy = context.getPageProxy();
        let action = '/SAPAssetManager/Actions/Forms/SDF/FormInstanceCreate.action';
        if (pageProxy.binding.FormInstanceID) {
            action = '/SAPAssetManager/Actions/Forms/SDF/FormInstanceUpdate.action';
        }
        return pageProxy.executeAction(action);
    } else if (communicationType === 'get' && data) {
        // junk data for now
        const tableName = 'MyEquipments';
        return context.read('/SAPAssetManager/Services/AssetManager.service', tableName, [], '$top=100').then(function(results) {
            const resultData = [];
            for (let x = 0; x < results.length; x++) {
                const item = results.getItem(x);
                resultData.push({EquipId: item.EquipId, Description: item.EquipDesc});
            }
            return JSON.stringify(resultData);
        });
    }
}
