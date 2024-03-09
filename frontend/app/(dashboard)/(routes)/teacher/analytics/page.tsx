'use client';
import { DataCard } from './_components/data-card';
import { Chart } from './_components/chart';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import { Analytic } from '@/types';

const AnalyticsPage = () => {
    const axiosPrivate = useAxiosPrivate();

    const { data } = useQuery({
        queryKey: ['get-analist'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/purchases/analist`,
            );

            return response.data as Analytic;
        },
    });

    if (!data) return null;

    return (
        <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <DataCard
                    label='Total Revenue'
                    value={data.total_revenue}
                    shouldFormat
                />
                <DataCard label='Total Sales' value={data.total_sales} />
            </div>
            <Chart data={data.data} />
        </div>
    );
};

export default AnalyticsPage;
