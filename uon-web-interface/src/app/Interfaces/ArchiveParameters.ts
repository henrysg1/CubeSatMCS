export interface Sample {
    time: Date;
    avg: number;
    min: number;
    max: number;
    n: number;
  
  }
  export interface TimeSeries {
    sample: Sample[];
  }
  