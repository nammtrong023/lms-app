'use client';

import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useConfettiStore } from '@/hooks/use-confetti-store';
import { BASE_URL } from '@/lib/config';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useQueryClient } from '@tanstack/react-query';

interface CourseProgressButtonProps {
    chapterId: number;
    courseId: number;
    isCompleted?: boolean;
    nextChapterId?: number;
}

export const CourseProgressButton = ({
    chapterId,
    courseId,
    isCompleted,
    nextChapterId,
}: CourseProgressButtonProps) => {
    const router = useRouter();
    const confetti = useConfettiStore();
    const queryClient = useQueryClient();

    const axiosPrivate = useAxiosPrivate();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            await axiosPrivate.put(
                `${BASE_URL}/progress/courses/${courseId}/chapters/${chapterId}/progress`,
                {
                    is_completed: !isCompleted,
                },
            );

            if (!isCompleted && !nextChapterId) {
                confetti.onOpen();
            }

            if (!isCompleted && nextChapterId) {
                router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
            }

            toast.success('Progress updated');
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
            queryClient.invalidateQueries({
                queryKey: ['get-chapter-dashboard'],
            });
        }
    };

    const Icon = isCompleted ? XCircle : CheckCircle;

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            type='button'
            variant={isCompleted ? 'outline' : 'success'}
            className='w-full md:w-auto'
        >
            {isCompleted ? 'Not completed' : 'Mark as complete'}
            <Icon className='h-4 w-4 ml-2' />
        </Button>
    );
};
