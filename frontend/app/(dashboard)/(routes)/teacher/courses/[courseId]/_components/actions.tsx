'use client';

import { Trash } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { useConfettiStore } from '@/hooks/use-confetti-store';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { BASE_URL } from '@/lib/config';
import { useQueryClient } from '@tanstack/react-query';

interface ActionsProps {
    disabled: boolean;
    courseId: string;
    isPublished: boolean;
}

export const Actions = ({ disabled, courseId, isPublished }: ActionsProps) => {
    const router = useRouter();
    const confetti = useConfettiStore();
    const queryClient = useQueryClient();

    const axiosPrivate = useAxiosPrivate();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isPublished) {
                await axiosPrivate.patch(
                    `${BASE_URL}/courses/${courseId}/publish?action=unpublish`,
                );
                toast.success('Course unpublished');
            } else {
                await axiosPrivate.patch(
                    `${BASE_URL}/courses/${courseId}/publish?action=publish`,
                );
                toast.success('Course published');
                confetti.onOpen();
            }

            router.refresh();
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ['get-course'] });
        }
    };

    const onDelete = async () => {
        try {
            setIsLoading(true);
            await axiosPrivate.delete(`${BASE_URL}/courses/${courseId}`);

            toast.success('Course deleted');
            router.refresh();
            router.push(`/teacher/courses`);
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ['get-course'] });
        }
    };

    return (
        <div className='flex items-center gap-x-2'>
            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                variant='outline'
                size='sm'
            >
                {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
            <ConfirmModal onConfirm={onDelete}>
                <Button variant='destructive' size='sm' disabled={isLoading}>
                    <Trash className='h-4 w-4' />
                </Button>
            </ConfirmModal>
        </div>
    );
};
