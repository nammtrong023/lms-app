'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { BASE_URL } from '@/lib/config';

interface ChapterTitleFormProps {
    initialData: {
        title: string;
    };
    courseId: number;
    chapterId: number;
}

const formSchema = z.object({
    title: z.string().min(1),
});

export const ChapterTitleForm = ({
    initialData,
    courseId,
    chapterId,
}: ChapterTitleFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const axiosPrivate = useAxiosPrivate();

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axiosPrivate.patch(
                `${BASE_URL}/courses/${courseId}/chapters/${chapterId}`,
                values,
            );
            toast.success('Chapter updated');
            toggleEdit();
        } catch {
            toast.error('Something went wrong');
        } finally {
            queryClient.invalidateQueries({ queryKey: ['get-chapter'] });
        }
    };

    return (
        <div className='mt-6 border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                Chapter title
                <Button onClick={toggleEdit} variant='ghost'>
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className='h-4 w-4 mr-2' />
                            Edit title
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && <p className='text-sm mt-2'>{initialData.title}</p>}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 mt-4'
                    >
                        <FormField
                            control={form.control}
                            name='title'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="e.g. 'Introduction to the course'"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex items-center gap-x-2'>
                            <Button
                                disabled={!isValid || isSubmitting}
                                type='submit'
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};
