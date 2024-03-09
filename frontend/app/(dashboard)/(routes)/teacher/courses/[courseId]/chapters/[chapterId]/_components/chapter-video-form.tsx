'use client';

import * as z from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Video } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';
import { Chapter } from '@/types';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { BASE_URL } from '@/lib/config';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface ChapterVideoFormProps {
    initialData: Chapter;
    courseId: number;
    chapterId: number;
}

const formSchema = z.object({
    video_url: z.string().min(1),
});

export const ChapterVideoForm = ({
    initialData,
    courseId,
    chapterId,
}: ChapterVideoFormProps) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axiosPrivate.patch(
                `${BASE_URL}/courses/${courseId}/chapters/${chapterId}`,
                values,
            );
            toast.success('Chapter updated');
            toggleEdit();
        } catch {
            console.log(values);
            toast.error('Something went wrong');
        } finally {
            setIsEditing(false);
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['get-chapter'] });
        }
    };

    return (
        <div className='mt-6 border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                Chapter video (16:9 recommend)
                <Button onClick={toggleEdit} variant='ghost'>
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData.video_url && (
                        <>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Add a video
                        </>
                    )}
                    {!isEditing && initialData.video_url && (
                        <>
                            <Pencil className='h-4 w-4 mr-2' />
                            Edit video
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.video_url ? (
                    <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
                        <Video className='h-10 w-10 text-slate-500' />
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2 max-h-[400px] mx-auto'>
                        <video
                            controls
                            src={initialData.video_url}
                            className='object-contain rounded-xl max-h-[400px] h-full w-full'
                        />
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload
                        value={videoUrl}
                        resourceType='video'
                        onChange={(video) => setVideoUrl(video)}
                        onRemove={() => setVideoUrl('')}
                        onSubmit={() => onSubmit({ video_url: videoUrl })}
                    />
                    <div className='text-xs text-muted-foreground mt-4'>
                        Upload this chapter&apos;s video
                    </div>
                </div>
            )}
            {initialData.video_url && !isEditing && (
                <div className='text-xs text-muted-foreground mt-2'>
                    Videos can take a few minutes to process. Refresh the page
                    if video does not work.
                </div>
            )}
        </div>
    );
};
