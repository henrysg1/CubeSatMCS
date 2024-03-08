import { Observable } from 'rxjs';
import { BehaviorSubject, lastValueFrom, Subject } from 'rxjs';
import { DataSourceType, NamedObjectId, ParameterTypeInfo, UsedByInfo } from './ListParameterResponse';

/**
 * Needs refinement
 */

export var graphData = new Subject<UpdateSeries>();

export var archiveGraphNames: string[] = [];
export var calls:number[]=[];
export var createdRealTimeGraphsInstanceAndQualifiedNames: string[] = [];
export var callMatchingMap = new Map<number,string>(); //matches the key = qualifiedParam name to the according websoscket call
export var qualifiedParameterNamesList: string[] = []; //storing the qualified names of the parameters inside the sidenav

export var yamcsBaseUrl: string = "http://localhost:8090/api";

export interface GraphData {
    type: string;
    name: string;
    series: Series[];
}

export interface Series {
    name: Date;
    value: number;
}

export interface UpdateSeries {
    name: string;
    call: number;
    isOfType: boolean;
    value: Series;
    type: string;
}


export interface ngxData {
    data: [
        { 
            type: string;
            name: string;
            series: Series[];
        }
    ]
};

export var typesOfGraphs: string[] = ["integer", "float"];


export var archiveData = [
    {
        type: "Housekeeping",
        name: "",
        series: [
            {
                name: new Date(),
                value: 0
            }
        ]
    }
]