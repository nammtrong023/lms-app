'use client';
import { Course } from '@/types';
import { BASE_URL } from '@/lib/config';
import { redirect } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/use-axios-private';

const CourseIdPage = ({ params }: { params: { courseId: string } }) => {
    const axiosPrivate = useAxiosPrivate();

    const { data } = useQuery({
        queryKey: ['get-public-course'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/courses/public-course/${params.courseId}`,
            );

            return response.data as Course;
        },
    });

    if (!data) return null;

    return redirect(`/courses/${data.id}/chapters/${data.chapters[0].id}`);
};

export default CourseIdPage;
