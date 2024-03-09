'use client';

import { SearchInput } from '@/components/search-input';
import { CoursesList } from '@/components/courses-list';

import { Categories } from './_components/categories';
import { useQuery } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { BASE_URL } from '@/lib/config';
import { Category } from '@/types';
import useFilter from '@/hooks/use-filter';
import { useEffect } from 'react';

interface SearchPageProps {
    searchParams: {
        title: string;
        category_id: number;
    };
}

const SearchPage = ({ searchParams }: SearchPageProps) => {
    const axiosPrivate = useAxiosPrivate();

    const { courses, refetch } = useFilter({
        category_id: searchParams.category_id,
        title: searchParams.title,
    });

    const { data: categories } = useQuery({
        queryKey: ['get-categories'],
        queryFn: async () => {
            const response = await axiosPrivate.get(`${BASE_URL}/categories`);

            return response.data as Category[];
        },
    });

    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    if (!categories || !courses) return null;

    return (
        <>
            <div className='px-6 pt-6 md:hidden md:mb-0 block'>
                <SearchInput />
            </div>
            <div className='p-6 space-y-4'>
                <Categories items={categories} />
                <CoursesList items={courses} />
            </div>
        </>
    );
};

export default SearchPage;
