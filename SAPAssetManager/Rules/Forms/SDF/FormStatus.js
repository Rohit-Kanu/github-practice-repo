/**** for display in the objectcell, *NOT* what is passed to the form runner
 * 
 * @param {IClientAPI} context 
 * @returns {string}
 */
export default function FormStatus(context) {
    let status = '-';

    switch (context.binding.FormStatus) {
        case 'New':
            status = context.localizeText('sdf_status_new');
            break;
        case 'In Process':
            status = context.localizeText('sdf_status_in_process');
            break;
        case 'Completed':
            status = context.localizeText('sdf_status_completed');
            break;
        case 'Reopened':
            status = context.localizeText('sdf_status_reopened');
            break;
        case 'Archived':
            status = context.localizeText('sdf_status_archived');
            break;
        case '':
        case undefined:
        case null:
            status = '-';
            break;
        default:
            status = context.binding.FormStatus;
            break;
    }

    return status;
}
