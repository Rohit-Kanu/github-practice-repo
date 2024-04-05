/*Notification constact file*/
export default class{
    static get veryHighPriority(){
        return '1';
    }
    static get highPriority(){
        return '2';
    }
    static get defaultType(){
        return 'M2';
    }
    static get defaultDescription(){
        return "Malfunction Equipment - Measuring pt";
    }
    static get MP(){
        return "MP-"
    }
    static get measurementReading(){
        return "Measurement Reading-"
    }
    }