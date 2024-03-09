'use client';
import Link from 'next/link';
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';
import { IconBadge } from '@/components/icon-badge';
import { Banner } from '@/components/banner';
import { ChapterTitleForm } from './_components/chapter-title-form';
import { ChapterDescriptionForm } from './_components/chapter-description-form';
import { ChapterAccessForm } from './_components/chapter-access-form';
import { ChapterVideoForm } from './_components/chapter-video-form';
import { ChapterActions } from './_components/chapter-actions';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import { Chapter } from '@/types';
import useAxiosPrivate from '@/hooks/use-axios-private';

const ChapterIdPage = ({
    params,
}: {
    params: { courseId: string; chapterId: string };
}) => {
    const axiosPrivate = useAxiosPrivate();
    const parsedCourseId = parseInt(params.courseId);
    const parsedChapterId = parseInt(params.chapterId);

    const { data: chapter } = useQuery({
        queryKey: ['get-chapter'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/courses/${parsedCourseId}/chapters/${parsedChapterId}`,
            );

            return response.data as Chapter;
        },
    });

    if (!chapter) return null;

    const requiredFields = [
        chapter.title,
        chapter.description,
        chapter.video_url,
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;

    const isComplete = requiredFields.every(Boolean);

    return (
        <>
            {!chapter.is_published && (
                <Banner
                    variant='warning'
                    label='This chapter is unpublished. It will not be visible in the course'
                />
            )}
            <div className='p-6'>
                <div className='flex items-center justify-between'>
                    <div className='w-full'>
                        <Link
                            href={`/teacher/courses/${params.courseId}`}
                            className='flex items-center text-sm hover:opacity-75 transition mb-6'
                        >
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back to course setup
                        </Link>
                        <div className='flex items-center justify-between w-full'>
                            <div className='flex flex-col gap-y-2'>
                                <h1 className='text-2xl font-medium'>
                                    Chapter Creation
                                </h1>
                                <span className='text-sm text-slate-700'>
                                    Complete all fields {completionText}
                                </span>
                            </div>
                            <ChapterActions
                                disabled={!isComplete}
                                courseId={params.courseId}
                                chapterId={params.chapterId}
                                isPublished={chapter.is_published}
                            />
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-16'>
                    <div className='space-y-4'>
                        <div>
                            <div className='flex items-center gap-x-2'>
                                <IconBadge icon={LayoutDashboard} />
                                <h2 className='text-xl'>
                                    Customize your chapter
                                </h2>
                            </div>
                            <ChapterTitleForm
                                initialData={chapter}
                                courseId={parsedCourseId}
                                chapterId={parsedChapterId}
                            />
                            <ChapterDescriptionForm
                                initialData={chapter}
                                courseId={parsedCourseId}
                                chapterId={parsedChapterId}
                            />
                        </div>
                        <div>
                            <div className='flex items-center gap-x-2'>
                                <IconBadge icon={Eye} />
                                <h2 className='text-xl'>Access Settings</h2>
                            </div>
                            <ChapterAccessForm
                                initialData={chapter}
                                courseId={parsedCourseId}
                                chapterId={parsedChapterId}
                            />
                        </div>
                    </div>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <IconBadge icon={Video} />
                            <h2 className='text-xl'>Add a video</h2>
                        </div>
                        <ChapterVideoForm
                            initialData={chapter}
                            courseId={parsedCourseId}
                            chapterId={parsedChapterId}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChapterIdPage;
