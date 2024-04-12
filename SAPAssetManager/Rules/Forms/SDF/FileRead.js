import Logger from '../../Log/Logger';

/**
 * 
 * @param {IClientAPI} context 
 * @param {string} filename
 * @returns {Promise<string>}
 */
export default function FileRead(context, filename) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'DynamicFormConfigFiles', [], `$filter=FileName eq '${filename}'`).then(function(results) {
        if (results && results.length > 0 && results._array[0].FileContent !== '') {
            return results._array[0].FileContent;
        } else {
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySAPDynamicForms.global'), `Form ${filename} empty or not found`);
            throw new Error(`${filename} empty or not found`);
        }
    }).catch((err) => {
        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySAPDynamicForms.global'), `Failed to read ${filename}: ${err}`);
        return '';
    });
}
 
