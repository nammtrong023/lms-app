'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { BASE_URL } from '@/lib/config';
import useAxiosPrivate from '@/hooks/use-axios-private';

interface CourseEnrollButtonProps {
    price: number;
    courseId: number;
}

export const CourseEnrollButton = ({
    price,
    courseId,
}: CourseEnrollButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const onClick = async () => {
        try {
            setIsLoading(true);

            const response = await axiosPrivate.post(
                `${BASE_URL}/payment/courses/${courseId}`,
            );

            window.location.assign(response.data);
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            size='sm'
            className='w-full md:w-auto'
        >
            Enroll for {formatPrice(price)}
        </Button>
    );
};
