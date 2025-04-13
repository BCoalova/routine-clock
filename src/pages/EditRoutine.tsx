import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RoutineForm from '@/components/RoutineForm'
import { useRoutine } from '@/contexts/RoutineContext'
import { Skeleton } from '@/components/ui/skeleton'

const EditRoutine = () => {
    const { routines } = useRoutine()
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)

    const routine = routines.find(r => r.id === id)

    useEffect(() => {
        // Short timeout to prevent flashing if data is available quickly
        const timeout = setTimeout(() => {
            setIsLoading(false)
            if (!routine && !isLoading) {
                navigate('/routine-clock')
            }
        }, 300)

        return () => clearTimeout(timeout)
    }, [routine, navigate, isLoading])

    if (isLoading) {
        return (
            <div className='container max-w-md mx-auto px-4 py-6'>
                <Skeleton className='h-8 w-3/4 mb-4' />
                <Skeleton className='h-64 w-full rounded-lg' />
            </div>
        )
    }

    return routine ? <RoutineForm initialRoutine={routine} /> : null
}

export default EditRoutine
