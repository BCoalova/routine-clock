import React from "react";
import { Series, Rep } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/utils/timer-utils";
import { 
  PlusCircle, 
  Timer, 
  Repeat, 
  Dumbbell,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SeriesFormProps {
  series: Series;
  onChange: (series: Series) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const SeriesForm: React.FC<SeriesFormProps> = ({ 
  series, 
  onChange,
  onDelete,
  canDelete
}) => {
  const handleAmountChange = (value: number) => {
    onChange({
      ...series,
      seriesAmount: Math.max(1, value)
    });
  };
  
  const handleRestChange = (value: number) => {
    onChange({
      ...series,
      restSeries: Math.max(0, value)
    });
  };
  
  const handleAddRep = () => {
    onChange({
      ...series,
      reps: [
        ...series.reps,
        {
          id: crypto.randomUUID(),
          repAmount: 1,
          repDuration: 30,
          restDuration: 10
        }
      ]
    });
  };
  
  const handleRepChange = (updatedRep: Rep) => {
    onChange({
      ...series,
      reps: series.reps.map(rep => 
        rep.id === updatedRep.id ? updatedRep : rep
      )
    });
  };
  
  const handleDeleteRep = (repId: string) => {
    // Don't allow deleting if there's only one rep
    if (series.reps.length <= 1) return;
    
    onChange({
      ...series,
      reps: series.reps.filter(rep => rep.id !== repId)
    });
  };

  return (
    <div className="space-y-4 pb-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center mb-1 text-xs">
            <Repeat className="mr-1" size={14} />
            Series Amount
          </Label>
          <Input 
            type="number" 
            min={1}
            value={series.seriesAmount}
            onChange={(e) => handleAmountChange(parseInt(e.target.value) || 1)}
            className="h-8"
          />
        </div>
        <div>
          <Label className="flex items-center mb-1 text-xs">
            <Timer className="mr-1" size={14} />
            Rest Between Series
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={series.restSeries}
              onChange={(e) => handleRestChange(parseInt(e.target.value) || 0)}
              className="h-8"
            />
            <span className="text-xs text-muted-foreground w-12">
              {formatTime(series.restSeries)}
            </span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-medium">Reps ({series.reps.length})</Label>
          {canDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete} 
              className="h-7 hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
        
        <Accordion type="multiple" defaultValue={series.reps.map((_, idx) => `rep-${idx}`)}>
          {series.reps.map((rep, index) => (
            <RepItem 
              key={rep.id} 
              rep={rep} 
              index={index}
              onChange={handleRepChange}
              onDelete={() => handleDeleteRep(rep.id)}
              canDelete={series.reps.length > 1}
            />
          ))}
        </Accordion>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAddRep}
          className="w-full mt-2 text-xs h-8"
        >
          <PlusCircle size={14} className="mr-1" />
          Add Rep
        </Button>
      </div>
    </div>
  );
};

interface RepItemProps {
  rep: Rep;
  index: number;
  onChange: (rep: Rep) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const RepItem: React.FC<RepItemProps> = ({ rep, index, onChange, onDelete, canDelete }) => {
  const handleAmountChange = (value: number) => {
    onChange({
      ...rep,
      repAmount: Math.max(1, value)
    });
  };
  
  const handleDurationChange = (value: number) => {
    onChange({
      ...rep,
      repDuration: Math.max(1, value)
    });
  };
  
  const handleRestChange = (value: number) => {
    onChange({
      ...rep,
      restDuration: Math.max(0, value)
    });
  };
  
  // This prevents the accordion from toggling when clicking the delete button
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <AccordionItem value={`rep-${index}`} className="border-0 w-full">
      <div className="flex items-center w-full">
        <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-accent data-[state=open]:bg-accent text-sm flex-1 w-full">
          <div className="flex items-center w-full">
            <span className="font-medium">Rep {index + 1}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {rep.repAmount}x {formatTime(rep.repDuration)} / {formatTime(rep.restDuration)} rest
            </span>
          </div>
        </AccordionTrigger>
        {canDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteClick}
            className="h-7 hover:text-destructive mr-2"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
      <AccordionContent className="px-3 py-2">
        <div className="space-y-3">
          <div>
            <Label className="flex items-center mb-1 text-xs">
              <Dumbbell className="mr-1" size={14} />
              Rep Amount
            </Label>
            <Input 
              type="number" 
              min={1}
              value={rep.repAmount}
              onChange={(e) => handleAmountChange(parseInt(e.target.value) || 1)}
              className="h-8"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs flex items-center">
                <Timer className="mr-1" size={14} />
                Rep Duration
              </Label>
              <span className="text-xs text-muted-foreground">
                {formatTime(rep.repDuration)}
              </span>
            </div>
            <Slider
              value={[rep.repDuration]}
              min={1}
              max={300}
              step={1}
              onValueChange={([value]) => handleDurationChange(value)}
              className="py-1"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs flex items-center">
                <MoreHorizontal className="mr-1" size={14} />
                Rest After Rep
              </Label>
              <span className="text-xs text-muted-foreground">
                {formatTime(rep.restDuration)}
              </span>
            </div>
            <Slider
              value={[rep.restDuration]}
              min={0}
              max={180}
              step={1}
              onValueChange={([value]) => handleRestChange(value)}
              className="py-1"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SeriesForm;
