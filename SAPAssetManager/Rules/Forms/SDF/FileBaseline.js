import FileRead from './FileRead';

/**
 * 
 * @param {IClientAPI} context 
 * @returns {Promise<string>}
 */
export default function FileBaseline(context) {
    const filename = context.getGlobalDefinition('/SAPAssetManager/Globals/Forms/SDF/JSFilename.global');
    return FileRead(context, filename);
}
 
