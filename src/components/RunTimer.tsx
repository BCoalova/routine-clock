import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Routine } from "@/types";
import { formatTime } from "@/utils/timer-utils";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RefreshCw,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RunTimerProps {
  routine: Routine;
}

interface TimerState {
  currentSeriesIndex: number;
  currentRepIndex: number;
  currentCycle: number;
  phase: "work" | "rest" | "seriesRest";
  timeRemaining: number;
  isRunning: boolean;
  isComplete: boolean;
}

const RunTimer: React.FC<RunTimerProps> = ({ routine }) => {
  const [timer, setTimer] = useState<TimerState>({
    currentSeriesIndex: 0,
    currentRepIndex: 0,
    currentCycle: 1,
    phase: "work",
    timeRemaining: routine.timer[0]?.reps[0]?.repDuration || 0,
    isRunning: false,
    isComplete: false
  });
  
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const navigate = useNavigate();
  
  // Calculate total workout time
  useEffect(() => {
    let total = 0;
    
    for (const series of routine.timer) {
      for (let i = 0; i < series.seriesAmount; i++) {
        for (const rep of series.reps) {
          for (let j = 0; j < rep.repAmount; j++) {
            total += rep.repDuration;
            if (j < rep.repAmount - 1) {
              total += rep.restDuration;
            }
          }
        }
        if (i < series.seriesAmount - 1) {
          total += series.restSeries;
        }
      }
    }
    
    setTotalTime(total);
  }, [routine]);
  
  // Timer logic
  const advanceTimer = useCallback(() => {
    setTimer(prevState => {
      const { 
        currentSeriesIndex, 
        currentRepIndex, 
        currentCycle, 
        phase,
        timeRemaining 
      } = prevState;
      
      if (timeRemaining > 1) {
        // Continue current interval
        return {
          ...prevState,
          timeRemaining: timeRemaining - 1
        };
      }
      
      const currentSeries = routine.timer[currentSeriesIndex];
      
      if (!currentSeries) {
        return { ...prevState, isComplete: true, isRunning: false };
      }
      
      const currentRep = currentSeries.reps[currentRepIndex];
      
      if (!currentRep) {
        return { ...prevState, isComplete: true, isRunning: false };
      }
      
      if (phase === "work") {
        // Work phase complete, transition to rest or next rep
        if (currentRep.restDuration > 0) {
          // Start rest period after this rep
          return {
            ...prevState,
            phase: "rest",
            timeRemaining: currentRep.restDuration
          };
        } else {
          // No rest, move to next rep
          return advanceToNextStep(prevState);
        }
      } else if (phase === "rest") {
        // Rest phase complete, move to next rep
        return advanceToNextStep(prevState);
      } else if (phase === "seriesRest") {
        // Series rest complete, move to next series/cycle
        const nextSeriesIndex = currentCycle >= currentSeries.seriesAmount 
          ? currentSeriesIndex + 1 
          : currentSeriesIndex;
        
        const nextCycle = currentCycle >= currentSeries.seriesAmount 
          ? 1 
          : currentCycle + 1;
          
        if (nextSeriesIndex >= routine.timer.length) {
          // Workout complete
          return {
            ...prevState,
            isComplete: true,
            isRunning: false
          };
        }
        
        return {
          ...prevState,
          currentSeriesIndex: nextSeriesIndex,
          currentCycle: nextCycle,
          currentRepIndex: 0,
          phase: "work",
          timeRemaining: routine.timer[nextSeriesIndex]?.reps[0]?.repDuration || 0
        };
      }
      
      return prevState;
    });
  }, [routine]);
  
  const advanceToNextStep = (state: TimerState): TimerState => {
    const { 
      currentSeriesIndex, 
      currentRepIndex, 
      currentCycle 
    } = state;
    
    const currentSeries = routine.timer[currentSeriesIndex];
    
    if (!currentSeries) {
      return { ...state, isComplete: true, isRunning: false };
    }
    
    // Check if we need to move to the next rep
    if (currentRepIndex < currentSeries.reps.length - 1) {
      // Move to next rep
      const nextRepIndex = currentRepIndex + 1;
      return {
        ...state,
        currentRepIndex: nextRepIndex,
        phase: "work",
        timeRemaining: currentSeries.reps[nextRepIndex]?.repDuration || 0
      };
    } else {
      // We've completed all reps in this series
      // Check if we need to start a new cycle of the same series
      if (currentCycle < currentSeries.seriesAmount) {
        // More cycles of this series needed
        if (currentSeries.restSeries > 0) {
          return {
            ...state,
            phase: "seriesRest",
            timeRemaining: currentSeries.restSeries
          };
        } else {
          // No series rest, immediately start next cycle
          return {
            ...state,
            currentRepIndex: 0,
            currentCycle: currentCycle + 1,
            phase: "work",
            timeRemaining: currentSeries.reps[0]?.repDuration || 0
          };
        }
      } else {
        // We've completed all cycles of this series
        // Move to the next series
        const nextSeriesIndex = currentSeriesIndex + 1;
        
        if (nextSeriesIndex >= routine.timer.length) {
          // Workout complete
          return {
            ...state,
            isComplete: true,
            isRunning: false
          };
        }
        
        return {
          ...state,
          currentSeriesIndex: nextSeriesIndex,
          currentRepIndex: 0,
          currentCycle: 1,
          phase: "work",
          timeRemaining: routine.timer[nextSeriesIndex]?.reps[0]?.repDuration || 0
        };
      }
    }
  };
  
  // Timer tick
  useEffect(() => {
    let interval: number | undefined;
    
    if (timer.isRunning && !timer.isComplete) {
      interval = window.setInterval(() => {
        advanceTimer();
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.isComplete, advanceTimer]);
  
  // Controls
  const togglePlayPause = () => {
    setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };
  
  const resetTimer = () => {
    setTimer({
      currentSeriesIndex: 0,
      currentRepIndex: 0,
      currentCycle: 1,
      phase: "work",
      timeRemaining: routine.timer[0]?.reps[0]?.repDuration || 0,
      isRunning: false,
      isComplete: false
    });
    setElapsedTime(0);
  };
  
  const skipForward = () => {
    setTimer(prevState => {
      // If already complete, do nothing
      if (prevState.isComplete) return prevState;
      
      // If in middle of an interval, skip to the end
      if (prevState.timeRemaining > 1) {
        return { ...prevState, timeRemaining: 1 };
      }
      
      // Otherwise advance to next step
      return advanceToNextStep(prevState);
    });
  };
  
  const skipBackward = () => {
    setTimer(prevState => {
      // If we're at the beginning or workout is complete, do nothing
      if ((prevState.currentSeriesIndex === 0 && 
           prevState.currentRepIndex === 0 && 
           prevState.currentCycle === 1 && 
           prevState.phase === "work") || 
          prevState.isComplete) {
        return { ...prevState, timeRemaining: routine.timer[0]?.reps[0]?.repDuration || 0 };
      }
      
      // If in the middle of an interval, restart current interval
      if (prevState.timeRemaining < 
          (prevState.phase === "work" 
            ? routine.timer[prevState.currentSeriesIndex]?.reps[prevState.currentRepIndex]?.repDuration 
            : prevState.phase === "rest"
              ? routine.timer[prevState.currentSeriesIndex]?.reps[prevState.currentRepIndex]?.restDuration
              : routine.timer[prevState.currentSeriesIndex]?.restSeries) - 1) {
        
        return { 
          ...prevState, 
          timeRemaining: prevState.phase === "work" 
            ? routine.timer[prevState.currentSeriesIndex]?.reps[prevState.currentRepIndex]?.repDuration || 0
            : prevState.phase === "rest"
              ? routine.timer[prevState.currentSeriesIndex]?.reps[prevState.currentRepIndex]?.restDuration || 0
              : routine.timer[prevState.currentSeriesIndex]?.restSeries || 0
        };
      }
      
      // Otherwise, go back to previous interval
      if (prevState.phase === "rest") {
        // Go back to work phase of current rep
        return {
          ...prevState,
          phase: "work",
          timeRemaining: routine.timer[prevState.currentSeriesIndex]?.reps[prevState.currentRepIndex]?.repDuration || 0
        };
      } else if (prevState.phase === "seriesRest") {
        // Go back to last rep of current series
        const series = routine.timer[prevState.currentSeriesIndex];
        return {
          ...prevState,
          phase: "work",
          currentRepIndex: series?.reps.length - 1 || 0,
          timeRemaining: series?.reps[series?.reps.length - 1]?.repDuration || 0
        };
      } else if (prevState.phase === "work") {
        // Go back to previous rep or previous series
        if (prevState.currentRepIndex > 0) {
          // Go back to previous rep
          const prevRepIndex = prevState.currentRepIndex - 1;
          return {
            ...prevState,
            currentRepIndex: prevRepIndex,
            phase: "work",
            timeRemaining: routine.timer[prevState.currentSeriesIndex]?.reps[prevRepIndex]?.repDuration || 0
          };
        } else if (prevState.currentCycle > 1) {
          // Go back to previous cycle of same series
          const series = routine.timer[prevState.currentSeriesIndex];
          return {
            ...prevState,
            currentCycle: prevState.currentCycle - 1,
            currentRepIndex: series?.reps.length - 1 || 0,
            phase: "work",
            timeRemaining: series?.reps[series?.reps.length - 1]?.repDuration || 0
          };
        } else if (prevState.currentSeriesIndex > 0) {
          // Go back to previous series
          const prevSeriesIndex = prevState.currentSeriesIndex - 1;
          const prevSeries = routine.timer[prevSeriesIndex];
          return {
            ...prevState,
            currentSeriesIndex: prevSeriesIndex,
            currentCycle: prevSeries?.seriesAmount || 1,
            currentRepIndex: prevSeries?.reps.length - 1 || 0,
            phase: "work",
            timeRemaining: prevSeries?.reps[prevSeries?.reps.length - 1]?.repDuration || 0
          };
        }
      }
      
      // Fallback
      return prevState;
    });
  };
  
  // Get current phase details
  const currentSeries = routine.timer[timer.currentSeriesIndex];
  const currentRep = currentSeries?.reps[timer.currentRepIndex];
  
  let phaseLabel = "";
  let phaseColor = "";
  
  if (timer.phase === "work") {
    phaseLabel = "WORK";
    phaseColor = "bg-primary text-primary-foreground";
  } else if (timer.phase === "rest") {
    phaseLabel = "REST";
    phaseColor = "bg-secondary text-secondary-foreground";
  } else {
    phaseLabel = "SERIES REST";
    phaseColor = "bg-muted text-muted-foreground";
  }
  
  // Overall progress
  const progressPercentage = totalTime > 0 
    ? (elapsedTime / totalTime) * 100 
    : 0;
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold truncate flex-1">{routine.name}</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/routine-clock")}
          className="ml-2"
        >
          <X size={20} />
        </Button>
      </div>
      
      <div className={`rounded-xl p-6 shadow-lg mb-6 ${phaseColor}`}>
        <div className="text-center">
          <div className="text-xs font-semibold mb-1">
            {timer.isComplete ? "COMPLETE" : phaseLabel}
          </div>
          <div className="text-5xl font-bold timer-text tracking-wider">
            {formatTime(timer.timeRemaining)}
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs opacity-90">
            <div>
              Series {timer.currentSeriesIndex + 1}/{routine.timer.length}
            </div>
            <div>
              Cycle {timer.currentCycle}/{currentSeries?.seriesAmount || 1}
            </div>
            <div>
              Rep {timer.currentRepIndex + 1}/{currentSeries?.reps.length || 0}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{formatTime(elapsedTime)} / {formatTime(totalTime)}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex justify-center items-center gap-4 mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipBackward}
          disabled={timer.isComplete}
          className="rounded-full w-12 h-12"
        >
          <SkipBack size={20} />
        </Button>
        
        <Button 
          size="icon" 
          onClick={togglePlayPause}
          disabled={timer.isComplete}
          variant="default"
          className="rounded-full w-16 h-16"
        >
          {timer.isRunning ? <Pause size={24} /> : <Play size={24} />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={skipForward}
          disabled={timer.isComplete}
          className="rounded-full w-12 h-12"
        >
          <SkipForward size={20} />
        </Button>
      </div>
      
      {(timer.isComplete || elapsedTime > 0) && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetTimer}
            className="rounded-full"
          >
            <RefreshCw size={16} className="mr-2" />
            Restart
          </Button>
        </div>
      )}
    </div>
  );
};

export default RunTimer;
