
export interface Rep {
  id: string;
  repAmount: number;
  repDuration: number; // in seconds
  restDuration: number; // in seconds
}

export interface Series {
  id: string;
  reps: Rep[];
  seriesAmount: number;
  restSeries: number; // in seconds
}

export interface Routine {
  id: string;
  name: string;
  timer: Series[];
}
