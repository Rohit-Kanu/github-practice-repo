
import GetCurrentGeometry from '../../Geometries/GetCurrentGeometry';

export default function FunctionalLocationGetCurrentLocation(context) {
    return GetCurrentGeometry(context, 'FunctionalLocation').then(result => {
        if (result) {
            var container = context.getControls()[0];
            // redraw LocationButtonsSection 
            container.getSection('LocationButtonsSection').redraw();
        }
    });
}
