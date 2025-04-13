
import { Routine, Series, Rep } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateTotalTime = (routine: Routine): number => {
  let totalSeconds = 0;
  
  routine.timer.forEach(series => {
    let seriesTime = 0;
    
    series.reps.forEach(rep => {
      seriesTime += (rep.repDuration + rep.restDuration) * rep.repAmount;
    });
    
    // Add rest time after each series (except the last one)
    seriesTime += series.restSeries;
    
    // Multiply by the number of times the series repeats
    totalSeconds += seriesTime * series.seriesAmount;
  });
  
  // Remove the rest time after the last series
  if (routine.timer.length > 0) {
    const lastSeries = routine.timer[routine.timer.length - 1];
    totalSeconds -= lastSeries.restSeries;
  }
  
  return totalSeconds;
};

export const createEmptyRep = (): Rep => ({
  id: uuidv4(),
  repAmount: 1,
  repDuration: 30,
  restDuration: 10
});

export const createEmptySeries = (): Series => ({
  id: uuidv4(),
  reps: [createEmptyRep()],
  seriesAmount: 1,
  restSeries: 60
});

export const createEmptyRoutine = (name = "New Workout"): Routine => ({
  id: uuidv4(),
  name,
  timer: [createEmptySeries()]
});

export const getLocalStorageRoutines = (): Routine[] => {
  const savedRoutines = localStorage.getItem('workout-routines');
  return savedRoutines ? JSON.parse(savedRoutines) : [];
};

export const saveLocalStorageRoutines = (routines: Routine[]): void => {
  localStorage.setItem('workout-routines', JSON.stringify(routines));
};
