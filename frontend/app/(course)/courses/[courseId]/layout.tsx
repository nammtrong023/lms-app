'use client';

import { CourseSidebar } from './_components/course-sidebar';
import { CourseNavbar } from './_components/course-navbar';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import { Course } from '@/types';

const CourseLayout = ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { courseId: string };
}) => {
    const axiosPrivate = useAxiosPrivate();

    const { data } = useQuery({
        queryKey: ['get-public-course'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/courses/${params.courseId}/chapter-progress`,
            );

            return response.data as Course;
        },
    });

    const { data: progressCount } = useQuery({
        queryKey: ['get-progress-count'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/progress/${params.courseId}`,
            );

            return response.data;
        },
    });

    if (!data) return null;

    return (
        <div className='h-full'>
            <div className='h-[80px] md:pl-80 fixed inset-y-0 w-full z-50'>
                <CourseNavbar course={data} progressCount={progressCount} />
            </div>
            <div className='hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50'>
                <CourseSidebar course={data} progressCount={progressCount} />
            </div>
            <main className='md:pl-80 pt-[80px] h-full bg-white'>
                {children}
            </main>
        </div>
    );
};

export default CourseLayout;
