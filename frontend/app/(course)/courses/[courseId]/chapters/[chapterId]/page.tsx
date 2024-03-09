'use client';

import { Banner } from '@/components/banner';
import { Separator } from '@/components/ui/separator';
import { Preview } from '@/components/preview';

import { VideoPlayer } from './_components/video-player';
import { CourseEnrollButton } from './_components/course-enroll-button';
import { CourseProgressButton } from './_components/course-progress-button';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import { ChapterDashBoard } from '@/types';

const ChapterIdPage = ({
    params,
}: {
    params: { courseId: string; chapterId: string };
}) => {
    const axiosPrivate = useAxiosPrivate();
    const parsedChapterId = parseInt(params.chapterId);
    const parsedCourseId = parseInt(params.courseId);

    const { data: chapterDashboard } = useQuery({
        queryKey: ['get-chapter-dashboard'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/courses/${params.courseId}/chapters/${params.chapterId}/dashboard`,
            );

            return response.data as ChapterDashBoard;
        },
    });

    if (!chapterDashboard) return null;

    const { chapter, course_price, next_chapter, purchase, user_progress } =
        chapterDashboard;

    const isLocked = !chapter.is_free && !purchase;
    const completeOnEnd = !!purchase && !user_progress?.is_completed;

    return (
        <div>
            {user_progress?.is_completed && (
                <Banner
                    variant='success'
                    label='You already completed this chapter.'
                />
            )}
            {isLocked && (
                <Banner
                    variant='warning'
                    label='You need to purchase this course to watch this chapter.'
                />
            )}
            <div className='flex flex-col max-w-4xl mx-auto pb-20'>
                <div className='p-4'>
                    <VideoPlayer
                        chapterId={parsedChapterId}
                        title={chapter.title}
                        courseId={parsedCourseId}
                        nextChapterId={next_chapter?.id}
                        video_url={chapter.video_url}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className='p-4 flex flex-col md:flex-row items-center justify-between'>
                        <h2 className='text-2xl font-semibold mb-2'>
                            {chapter.title}
                        </h2>
                        {purchase && (
                            <CourseProgressButton
                                chapterId={parsedChapterId}
                                courseId={parsedCourseId}
                                nextChapterId={next_chapter?.id}
                                isCompleted={!!user_progress?.is_completed}
                            />
                        )}

                        {isLocked ? (
                            <CourseEnrollButton
                                courseId={parsedCourseId}
                                price={course_price!}
                            />
                        ) : null}
                    </div>
                    <Separator />
                    <div>
                        <Preview value={chapter.description!} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChapterIdPage;
