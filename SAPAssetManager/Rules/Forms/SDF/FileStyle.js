import FileRead from './FileRead';

/**
 * 
 * @param {IClientAPI} context 
 * @returns {Promise<string>}
 */
export default function FileStyle(context) {
    const filename = context.getGlobalDefinition('/SAPAssetManager/Globals/Forms/SDF/CSSFilename.global');
    return FileRead(context, filename);
}
 
