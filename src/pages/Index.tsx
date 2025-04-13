
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  TimerIcon,
  ChevronDown,
  Search
} from "lucide-react";
import RoutineCard from "@/components/RoutineCard";
import { useRoutine } from "@/contexts/RoutineContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { routines, deleteRoutine, setActiveRoutine } = useRoutine();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest">("newest");
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  
  // Filter and sort routines
  const filteredRoutines = routines
    .filter(routine => 
      routine.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        // Default sort is by newest (assuming id correlates with creation time)
        return b.id.localeCompare(a.id);
      }
    });
  
  const handlePlay = (routineId: string) => {
    navigate(`/timer/${routineId}`);
  };
  
  const handleEdit = (routineId: string) => {
    navigate(`/edit/${routineId}`);
  };
  
  const handleDeleteConfirm = () => {
    if (routineToDelete) {
      deleteRoutine(routineToDelete);
      setRoutineToDelete(null);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <TimerIcon className="mr-2" />
          Rhythm Ritual
        </h1>
        <Button onClick={() => navigate("/create")}>
          <PlusCircle size={18} className="mr-2" />
          New
        </Button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Sort
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setSortBy("newest")}
              className={sortBy === "newest" ? "bg-accent" : ""}
            >
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy("name")}
              className={sortBy === "name" ? "bg-accent" : ""}
            >
              Name
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredRoutines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No routines found</p>
          {searchTerm ? (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          ) : (
            <Button onClick={() => navigate("/create")}>
              Create Your First Routine
            </Button>
          )}
        </div>
      )}
      
      <div className="grid gap-4">
        {filteredRoutines.map(routine => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            onPlay={() => handlePlay(routine.id)}
            onEdit={() => handleEdit(routine.id)}
            onDelete={() => setRoutineToDelete(routine.id)}
          />
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!routineToDelete} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this routine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
