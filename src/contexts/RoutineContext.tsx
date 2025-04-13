import React, { createContext, useContext, useState, useEffect } from "react";
import { Routine, Series, Rep } from "@/types";
import { 
  createEmptyRoutine, 
  createEmptySeries,
  getLocalStorageRoutines, 
  saveLocalStorageRoutines 
} from "@/utils/timer-utils";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

type RoutineContextType = {
  routines: Routine[];
  activeRoutine: Routine | null;
  addRoutine: (name: string) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  setActiveRoutine: (routine: Routine | null) => void;
  addSeries: (routine: Routine) => void;
  updateSeries: (routineId: string, series: Series) => void;
  deleteSeries: (routineId: string, seriesId: string) => void;
  addRep: (routineId: string, seriesId: string) => void;
  updateRep: (routineId: string, seriesId: string, rep: Rep) => void;
  deleteRep: (routineId: string, seriesId: string, repId: string) => void;
};

export const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    const savedRoutines = getLocalStorageRoutines();
    
    if (savedRoutines.length === 0) {
      // Create a default workout if no routines exist
      const defaultRoutine = createEmptyRoutine("Example Workout");
      setRoutines([defaultRoutine]);
    } else {
      setRoutines(savedRoutines);
    }
  }, []);

  useEffect(() => {
    if (routines.length > 0) {
      saveLocalStorageRoutines(routines);
    }
  }, [routines]);

  const addRoutine = (name: string) => {
    const newRoutine = createEmptyRoutine(name);
    setRoutines([...routines, newRoutine]);
    toast({
      title: "Routine Created",
      description: `${name} has been added to your routines`,
    });
    return newRoutine;
  };

  const updateRoutine = (updatedRoutine: Routine) => {
    setRoutines(routines.map(routine => 
      routine.id === updatedRoutine.id ? updatedRoutine : routine
    ));
    
    if (activeRoutine?.id === updatedRoutine.id) {
      setActiveRoutine(updatedRoutine);
    }
    
    toast({
      title: "Routine Updated",
      description: `${updatedRoutine.name} has been updated`,
    });
  };

  const deleteRoutine = (id: string) => {
    const routineToDelete = routines.find(r => r.id === id);
    setRoutines(routines.filter(routine => routine.id !== id));
    
    if (activeRoutine?.id === id) {
      setActiveRoutine(null);
    }
    
    if (routineToDelete) {
      toast({
        title: "Routine Deleted",
        description: `${routineToDelete.name} has been removed`,
        variant: "destructive",
      });
    }
  };

  const addSeries = (routine: Routine) => {
    const updatedRoutine = {
      ...routine,
      timer: [...routine.timer, createEmptySeries()]
    };
    updateRoutine(updatedRoutine);
  };

  const updateSeries = (routineId: string, updatedSeries: Series) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      timer: routine.timer.map(series => 
        series.id === updatedSeries.id ? updatedSeries : series
      )
    };
    updateRoutine(updatedRoutine);
  };

  const deleteSeries = (routineId: string, seriesId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    // Don't allow deleting if there's only one series
    if (routine.timer.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "A routine must have at least one series",
        variant: "destructive",
      });
      return;
    }

    const updatedRoutine = {
      ...routine,
      timer: routine.timer.filter(series => series.id !== seriesId)
    };
    updateRoutine(updatedRoutine);
  };

  const addRep = (routineId: string, seriesId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      timer: routine.timer.map(series => {
        if (series.id === seriesId) {
          return {
            ...series,
            reps: [...series.reps, {
              id: uuidv4(),
              repAmount: 1,
              repDuration: 30,
              restDuration: 10
            }]
          };
        }
        return series;
      })
    };
    updateRoutine(updatedRoutine);
  };

  const updateRep = (routineId: string, seriesId: string, updatedRep: Rep) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const updatedRoutine = {
      ...routine,
      timer: routine.timer.map(series => {
        if (series.id === seriesId) {
          return {
            ...series,
            reps: series.reps.map(rep => 
              rep.id === updatedRep.id ? updatedRep : rep
            )
          };
        }
        return series;
      })
    };
    updateRoutine(updatedRoutine);
  };

  const deleteRep = (routineId: string, seriesId: string, repId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const series = routine.timer.find(s => s.id === seriesId);
    if (!series) return;
    
    // Don't allow deleting if there's only one rep
    if (series.reps.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "A series must have at least one rep",
        variant: "destructive",
      });
      return;
    }

    const updatedRoutine = {
      ...routine,
      timer: routine.timer.map(series => {
        if (series.id === seriesId) {
          return {
            ...series,
            reps: series.reps.filter(rep => rep.id !== repId)
          };
        }
        return series;
      })
    };
    updateRoutine(updatedRoutine);
  };

  const value = {
    routines,
    activeRoutine,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    setActiveRoutine,
    addSeries,
    updateSeries,
    deleteSeries,
    addRep,
    updateRep,
    deleteRep
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error("useRoutine must be used within a RoutineProvider");
  }
  return context;
};
