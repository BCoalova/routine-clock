import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Routine, Series, Rep } from '@/types'
import { createEmptyRoutine, formatTime, calculateTotalTime } from '@/utils/timer-utils'
import { useRoutine } from '@/contexts/RoutineContext'
import { ChevronLeft, PlusCircle, Trash2, Play, Save } from 'lucide-react'
import SeriesForm from './SeriesForm'
import { useNavigate } from 'react-router-dom'

interface RoutineFormProps {
    initialRoutine?: Routine
}

const RoutineForm: React.FC<RoutineFormProps> = ({ initialRoutine }) => {
    const [routine, setRoutine] = useState<Routine>(initialRoutine || createEmptyRoutine())
    const { updateRoutine, addRoutine } = useRoutine()
    const navigate = useNavigate()

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoutine({ ...routine, name: e.target.value })
    }

    const handleSave = () => {
        if (initialRoutine) {
            updateRoutine(routine)
        } else {
            addRoutine(routine.name)
        }
        navigate('/routine-clock')
    }

    const handleAddSeries = () => {
        const newSeries: Series = {
            id: crypto.randomUUID(),
            reps: [
                {
                    id: crypto.randomUUID(),
                    repAmount: 1,
                    repDuration: 30,
                    restDuration: 10,
                },
            ],
            seriesAmount: 1,
            restSeries: 60,
        }

        setRoutine({
            ...routine,
            timer: [...routine.timer, newSeries],
        })
    }

    const handleSeriesUpdate = (updatedSeries: Series) => {
        setRoutine({
            ...routine,
            timer: routine.timer.map(series => (series.id === updatedSeries.id ? updatedSeries : series)),
        })
    }

    const handleSeriesDelete = (seriesId: string) => {
        // Don't allow deleting if there's only one series
        if (routine.timer.length <= 1) return

        setRoutine({
            ...routine,
            timer: routine.timer.filter(series => series.id !== seriesId),
        })
    }

    const handlePlayRoutine = () => {
        updateRoutine(routine)
        navigate(`/routine-clock/timer/${routine.id}`)
    }

    return (
        <div className='container max-w-md mx-auto px-4 py-6'>
            <div className='flex items-center mb-4'>
                <Button variant='ghost' size='icon' onClick={() => navigate('/routine-clock')} className='mr-2'>
                    <ChevronLeft size={20} />
                </Button>
                <h1 className='text-2xl font-bold'>{initialRoutine ? 'Edit Routine' : 'Create Routine'}</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className='space-y-2'>
                        <Label htmlFor='routine-name'>Routine Name</Label>
                        <Input
                            id='routine-name'
                            value={routine.name}
                            onChange={handleNameChange}
                            placeholder='Enter routine name'
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='mb-4'>
                        <div className='flex justify-between items-center mb-2'>
                            <h2 className='text-lg font-medium'>Series</h2>
                            <div className='text-sm text-muted-foreground'>Total: {formatTime(calculateTotalTime(routine))}</div>
                        </div>

                        <Accordion type='multiple' defaultValue={routine.timer.map((_, idx) => `series-${idx}`)}>
                            {routine.timer.map((series, index) => (
                                <AccordionItem key={series.id} value={`series-${index}`}>
                                    <AccordionTrigger className='py-3'>
                                        <div className='flex items-center'>
                                            <span className='text-sm font-medium'>Series {index + 1}</span>
                                            <span className='ml-2 text-xs text-muted-foreground'>
                                                {series.seriesAmount}x {series.reps.length} reps
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <SeriesForm
                                            series={series}
                                            onChange={handleSeriesUpdate}
                                            onDelete={() => handleSeriesDelete(series.id)}
                                            canDelete={routine.timer.length > 1}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <Button
                            variant='outline'
                            onClick={handleAddSeries}
                            className='w-full mt-4 flex items-center justify-center'
                        >
                            <PlusCircle size={16} className='mr-2' />
                            Add Series
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                    <Button
                        variant='outline'
                        onClick={handlePlayRoutine}
                        className='flex items-center'
                        disabled={routine.name.trim() === ''}
                    >
                        <Play size={16} className='mr-2' />
                        Play
                    </Button>
                    <Button onClick={handleSave} className='flex items-center' disabled={routine.name.trim() === ''}>
                        <Save size={16} className='mr-2' />
                        Save
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default RoutineForm
