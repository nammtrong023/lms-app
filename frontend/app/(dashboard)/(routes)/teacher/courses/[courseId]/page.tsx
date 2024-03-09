'use client';

import { LayoutDashboard } from 'lucide-react';
import { IconBadge } from '@/components/icon-badge';
import { Banner } from '@/components/banner';
import { TitleForm } from './_components/title-form';
import { DescriptionForm } from './_components/description-form';
import { ImageForm } from './_components/image-form';
import { CategoryForm } from './_components/category-form';
import { PriceForm } from './_components/price-form';
import { ChaptersForm } from './_components/chapters-form';
import { Actions } from './_components/actions';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import { Category, Course } from '@/types';
import useAxiosPrivate from '@/hooks/use-axios-private';

const CourseIdPage = ({ params }: { params: { courseId: string } }) => {
    const axiosPrivate = useAxiosPrivate();

    const { data: course } = useQuery({
        queryKey: ['get-course'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/courses/${params.courseId}`,
            );

            return response.data as Course;
        },
    });

    const { data: categories } = useQuery({
        queryKey: ['get-all-categories'],
        queryFn: async () => {
            const response = await axiosPrivate.get(`${BASE_URL}/categories`);

            return response.data as Category[];
        },
    });

    if (!course || !categories) return null;

    const requiredFields = [
        course.title,
        course.description,
        course.image_url,
        course.price,
        course.category_id,
        course.chapters.some((chapter) => chapter.is_published),
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;
    const isComplete = requiredFields.every(Boolean);

    return (
        <>
            {!course.is_published && (
                <Banner label='This course is unpublished. It will not be visible to the students.' />
            )}
            <div className='p-6 bg-white'>
                <div className='flex items-center justify-between'>
                    <div className='flex flex-col gap-y-2'>
                        <h1 className='text-2xl font-medium'>Course setup</h1>
                        <span className='text-sm text-slate-700'>
                            Complete all fields {completionText}
                        </span>
                    </div>
                    <Actions
                        disabled={!isComplete}
                        courseId={params.courseId}
                        isPublished={course.is_published}
                    />
                </div>
                <div className='mt-16'>
                    <div className='flex items-center gap-x-2'>
                        <IconBadge icon={LayoutDashboard} />
                        <h2 className='text-xl'>Customize your course</h2>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <TitleForm
                                initialData={course}
                                courseId={course.id}
                            />
                            <DescriptionForm
                                initialData={course}
                                courseId={course.id}
                            />
                            <ImageForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div className='space-y-6'>
                            <CategoryForm
                                initialData={course}
                                courseId={course.id}
                                options={categories?.map((category) => ({
                                    label: category.name,
                                    value: category.id,
                                }))}
                            />
                            <ChaptersForm
                                initialData={course}
                                courseId={course.id}
                            />
                            <PriceForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseIdPage;
