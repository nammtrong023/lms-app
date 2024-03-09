'use client';
import { useQuery } from '@tanstack/react-query';
import qs from 'query-string';
import useAxiosPrivate from './use-axios-private';
import { BASE_URL } from '@/lib/config';
import { CourseWithProgress } from '@/types';

const URL = `${BASE_URL}/courses/courses-progress`;

interface Query {
    category_id?: number;
    title?: string;
}

const useFilter = (query: Query) => {
    const axiosPrivate = useAxiosPrivate();

    const url = qs.stringifyUrl({
        url: URL,
        query: {
            category_id: query.category_id,
            title: query.title,
        },
    });

    const {
        data: courses,
        isFetching,
        refetch,
    } = useQuery({
        initialData: [],
        queryKey: ['get-courses-progress'],
        queryFn: async () => {
            const response = await axiosPrivate.get(url);
            return response.data as CourseWithProgress[];
        },
    });

    return { courses, isFetching, refetch };
};

export default useFilter;
