export interface EngAndRawValue{
    floatValue:number;
    type:string;
  }
 export interface Value{
    acquisitionStatus: string;
    acquisitionTime:Date;
    acquisitionTimeUTC:Date;
    engValue:EngAndRawValue;
    generationTime:Date;
    generationTimeUTC:Date;
    numericId:number;
    rawValue:EngAndRawValue;
    length:number;
  }
  
  export interface ParameterData{
    values: Value[];
  }
  
 export interface ParameterReply{
    call:number;
    data:ParameterData; 
    seq:number;
    type:string;
  }