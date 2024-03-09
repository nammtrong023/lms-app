'use client';

import * as z from 'zod';
import { Pencil, PlusCircle, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { BASE_URL } from '@/lib/config';
import { FileUpload } from '@/components/file-upload';
import { Course } from '@/types';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useQueryClient } from '@tanstack/react-query';

interface ImageFormProps {
    initialData: Course;
    courseId: number;
}

const formSchema = z.object({
    image_url: z.string().min(1, {
        message: 'Image is required',
    }),
});

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axiosPrivate.patch(`${BASE_URL}/courses/${courseId}`, values);
            toast.success('Course updated');
            queryClient.invalidateQueries({ queryKey: ['get-course'] });
            toggleEdit();
            router.refresh();
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        }
    };

    return (
        <div className='mt-6 border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                Course image
                <Button onClick={toggleEdit} variant='ghost'>
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData.image_url && (
                        <>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Add an image
                        </>
                    )}
                    {!isEditing && initialData.image_url && (
                        <>
                            <Pencil className='h-4 w-4 mr-2' />
                            Edit image
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.image_url ? (
                    <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
                        <ImageIcon className='h-10 w-10 text-slate-500' />
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2'>
                        <Image
                            alt='Upload'
                            fill
                            className='object-cover rounded-md'
                            src={initialData.image_url}
                        />
                    </div>
                ))}
            {isEditing && (
                <FileUpload
                    value={imageUrl}
                    resourceType='image'
                    onChange={(image) => setImageUrl(image)}
                    onRemove={() => setImageUrl('')}
                    onSubmit={() => onSubmit({ image_url: imageUrl })}
                />
            )}
        </div>
    );
};
