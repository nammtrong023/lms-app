'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { FC, useCallback, useState } from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { BASE_URL } from '@/lib/config';
import axios from 'axios';

interface FileUploadProps {
    value: string;
    resourceType: 'image' | 'video';
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    onSubmit: () => void;
}

export const FileUpload: FC<FileUploadProps> = ({
    value,
    resourceType,
    onChange,
    onRemove,
    onSubmit,
}) => {
    const [isUploading, setIsUploading] = useState(false);

    const title = resourceType === 'image' ? 'Image Upload' : 'Video Upload';

    const handleUpload = useCallback(
        async (files: File[]) => {
            try {
                setIsUploading(true);

                const formData = new FormData();
                formData.append('file', files[0]);

                const response = await axios.post(
                    `${BASE_URL}/upload?resource_type=${resourceType}`,
                    formData,
                );

                onChange(response.data);
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setTimeout(() => {
                    setIsUploading(false);
                }, 200);
            }
        },
        [onChange, resourceType],
    );

    const { getRootProps, getInputProps } = useDropzone({
        accept:
            resourceType === 'image'
                ? {
                      'image/jpeg': [],
                      'image/png': [],
                  }
                : { 'video/mp4': [] },
        multiple: false,
        onDrop: handleUpload,
    });

    return (
        <div>
            <div className={cn('w-full')}>
                <div className='w-full min-h-[300px] h-fit border relative rounded-xl'>
                    {value ? (
                        <>
                            {isUploading ? (
                                <span className='absolute left-1/2 top-1/2 -translate-y-1/2'>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                </span>
                            ) : (
                                <div className={cn('relative w-full h-full')}>
                                    {resourceType === 'image' && (
                                        <Image
                                            src={value}
                                            fill
                                            priority
                                            sizes='100vw'
                                            alt='Uploaded image'
                                            className='object-cover rounded-xl'
                                        />
                                    )}

                                    {resourceType === 'video' && (
                                        <div className='relative aspect-video mt-2 max-h-[400px] mx-auto'>
                                            <video
                                                controls
                                                src={value}
                                                className='object-contain rounded-xl max-h-[400px] h-full w-full'
                                            />
                                        </div>
                                    )}

                                    <button
                                        onClick={() => onRemove(value)}
                                        className='w-6 h-6 flex items-center justify-center rounded-full z-10 bg-[#a4b0be] hover:!bg-opacity-90 absolute top-2 right-2'
                                    >
                                        <X className='w-4 h-4' color='#fff' />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='relative'>
                            <div
                                className='bg-grayf9 flex flex-col items-center justify-center gap-y-2 w-full min-h-[300px] rounded-xl hover:bg-opacity-20 transition-opacity duration-200 hover:bg-[#b2bec3] dark:hover:bg-gray78/20 cursor-pointer select-none'
                                {...getRootProps({})}
                            >
                                <input {...getInputProps({})} />
                                <button className='flex flex-col items-center gap-y-2 select-none w-full h-full focus-visible:ring-0 focus-visible:ring-offset-0'>
                                    <span className='w-12 h-12 text-zinc-700 rounded-full bg-slate-200 flex items-center justify-center'>
                                        <ImagePlus className='w-5 h-5' />
                                    </span>
                                    <p>{title}</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        disabled={value === ''}
                        type='submit'
                        onClick={onSubmit}
                        className='flex items-center justify-center mt-3'
                    >
                        Upload
                    </Button>
                </DialogFooter>
            </div>
        </div>
    );
};
