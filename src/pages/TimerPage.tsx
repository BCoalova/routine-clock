
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoutine } from "@/contexts/RoutineContext";
import RunTimer from "@/components/RunTimer";
import { Skeleton } from "@/components/ui/skeleton";

const TimerPage = () => {
  const { routines } = useRoutine();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const routine = routines.find(r => r.id === id);
  
  useEffect(() => {
    if (!routine) {
      navigate("/routine-clock");
    }
  }, [routine, navigate]);
  
  if (!routine) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }
  
  return <RunTimer routine={routine} />;
};

export default TimerPage;
