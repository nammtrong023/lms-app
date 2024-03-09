'use client';

import { DataTable } from './_components/data-table';
import { columns } from './_components/columns';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import useAxiosPrivate from '@/hooks/use-axios-private';

const CoursesPage = () => {
    const axiosPrivate = useAxiosPrivate();

    const { data } = useQuery({
        queryKey: ['get-all-courses'],
        queryFn: async () => {
            const response = await axiosPrivate.get(`${BASE_URL}/courses`);

            return response.data as any;
        },
    });

    if (!data) return null;

    return (
        <div className='p-6'>
            <DataTable columns={columns} data={data} />
        </div>
    );
};

export default CoursesPage;
