
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Routine } from "@/types";
import { calculateTotalTime, formatTime } from "@/utils/timer-utils";
import { Play, Edit, Trash2 } from "lucide-react";

interface RoutineCardProps {
  routine: Routine;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ 
  routine, 
  onPlay, 
  onEdit, 
  onDelete 
}) => {
  const totalTime = calculateTotalTime(routine);
  const totalSeries = routine.timer.length;
  const totalReps = routine.timer.reduce((sum, series) => 
    sum + series.reps.length * series.seriesAmount, 0);
  
  return (
    <Card className="timer-card">
      <CardContent className="pt-4">
        <h3 className="text-lg font-medium truncate">{routine.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Total:</span>
            <span className="text-sm font-medium timer-text">{formatTime(totalTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {totalSeries} {totalSeries === 1 ? "series" : "series"}
            </span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {totalReps} {totalReps === 1 ? "rep" : "reps"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete}
          className="h-8 w-8 rounded-full"
        >
          <Trash2 size={16} />
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onEdit}
            className="h-8 w-8 rounded-full"
          >
            <Edit size={16} />
          </Button>
          <Button 
            size="icon" 
            onClick={onPlay}
            className="h-8 w-8 rounded-full"
          >
            <Play size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoutineCard;
