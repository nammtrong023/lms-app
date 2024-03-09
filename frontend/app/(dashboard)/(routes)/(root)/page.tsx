'use client';

import { CheckCircle, Clock } from 'lucide-react';
import { InfoCard } from './_components/info-card';
import { CoursesList } from '@/components/courses-list';
import { useQuery } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { BASE_URL } from '@/lib/config';
import { CourseDashBoard } from '@/types';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const axiosPrivate = useAxiosPrivate();
    const [isMounted, setIsMounted] = useState(false);

    const { data } = useQuery({
        queryKey: ['get-dashboard-courses'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/courses/dashboard-courses`,
            );

            return response.data as CourseDashBoard;
        },
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!data || !isMounted) return null;

    const { completed_courses, courses_in_progress } = data;

    return (
        <div className='p-6 space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <InfoCard
                    icon={Clock}
                    label='In Progress'
                    numberOfItems={courses_in_progress.length}
                />
                <InfoCard
                    icon={CheckCircle}
                    label='Completed'
                    numberOfItems={completed_courses.length}
                    variant='success'
                />
            </div>
            <CoursesList
                items={[...courses_in_progress, ...completed_courses]}
            />
        </div>
    );
}
