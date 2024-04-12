/**
* Describe this function...
* @param {IClientAPI} clientAPI
*/
import comLib from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
export default function ZGetNotifNotesForCreateUpdate(clientAPI) {
    let notes = comLib.getStateVariable(clientAPI, 'ZNotifNotes');
    return notes;
}