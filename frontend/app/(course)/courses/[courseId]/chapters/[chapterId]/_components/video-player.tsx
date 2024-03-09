'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useConfettiStore } from '@/hooks/use-confetti-store';
import { BASE_URL } from '@/lib/config';
import useAxiosPrivate from '@/hooks/use-axios-private';

interface VideoPlayerProps {
    video_url: string;
    courseId: number;
    chapterId: number;
    nextChapterId?: number;
    isLocked: boolean;
    completeOnEnd: boolean;
    title: string;
}

export const VideoPlayer = ({
    video_url,
    courseId,
    chapterId,
    nextChapterId,
    isLocked,
    completeOnEnd,
    title,
}: VideoPlayerProps) => {
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();

    const axiosPrivate = useAxiosPrivate();
    const confetti = useConfettiStore();

    const onEnd = async () => {
        try {
            if (completeOnEnd) {
                await axiosPrivate.put(
                    `${BASE_URL}/progress/courses/${courseId}/chapters/${chapterId}/progress`,
                    {
                        is_completed: true,
                    },
                );

                if (!nextChapterId) {
                    confetti.onOpen();
                }

                toast.success('Progress updated');
                router.refresh();

                if (nextChapterId) {
                    router.push(
                        `/courses/${courseId}/chapters/${nextChapterId}`,
                    );
                }
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    return (
        <div className='relative aspect-video max-h-[400px] w-full'>
            {!isReady && !isLocked && (
                <div className='absolute inset-0 flex items-center justify-center bg-slate-800'>
                    <Loader2 className='h-8 w-8 animate-spin text-secondary' />
                </div>
            )}
            {isLocked && (
                <div className='absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary'>
                    <Lock className='h-8 w-8' />
                    <p className='text-sm'>This chapter is locked</p>
                </div>
            )}
            {!isLocked && (
                <video
                    controls
                    autoPlay
                    src={video_url}
                    title={title}
                    className={cn(!isReady && 'hidden')}
                    onCanPlay={() => setIsReady(true)}
                    onEnded={onEnd}
                />
            )}
        </div>
    );
};
