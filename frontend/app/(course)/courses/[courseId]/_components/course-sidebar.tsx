'use client';

import { Chapter, Course, Purchase, UserProgress } from '@/types';
import { CourseProgress } from '@/components/course-progress';
import { CourseSidebarItem } from './course-sidebar-item';
import { useAuth } from '@/components/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { BASE_URL } from '@/lib/config';

interface CourseSidebarProps {
    course: Course & {
        chapters: Chapter[];
    };
    progressCount: number;
}

export const CourseSidebar = ({
    course,
    progressCount,
}: CourseSidebarProps) => {
    const axiosPrivate = useAxiosPrivate();

    const { data: purchase } = useQuery({
        queryKey: ['get-purchase-by-courseId'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/purchases/courses/${course.id}`,
            );

            return response.data as Purchase;
        },
    });

    const chapterOrderd = course.chapters.sort(
        (a, b) => a.position - b.position,
    );

    return (
        <div className='h-full border-r flex flex-col overflow-y-auto shadow-sm'>
            <div className='p-8 flex flex-col border-b'>
                <h1 className='font-semibold'>{course.title}</h1>
                {purchase && (
                    <div className='mt-10'>
                        <CourseProgress
                            variant='success'
                            value={progressCount}
                        />
                    </div>
                )}
            </div>
            <div className='flex flex-col w-full'>
                {chapterOrderd.map((chapter) => (
                    <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        label={chapter.title}
                        isCompleted={!!chapter.user_progress?.[0]?.is_completed}
                        courseId={course.id}
                        isLocked={!chapter.is_free && !purchase}
                    />
                ))}
            </div>
        </div>
    );
};
