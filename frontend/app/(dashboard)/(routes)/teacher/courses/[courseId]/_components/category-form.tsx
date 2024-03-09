'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import { Course } from '@/types';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';

interface CategoryFormProps {
    initialData: Course;
    courseId: number;
    options: { label: string; value: number }[];
}

const formSchema = z.object({
    category_id: z.coerce.number(),
});

export const CategoryForm = ({
    initialData,
    courseId,
    options,
}: CategoryFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category_id: initialData?.category_id || 0,
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axiosPrivate.patch(`${BASE_URL}/courses/${courseId}`, values);
            queryClient.invalidateQueries({ queryKey: ['get-course'] });
            toast.success('Course updated');
            toggleEdit();
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        }
    };

    const selectedOption = options.find(
        (option) => option.value === initialData.category_id,
    );

    return (
        <div className='mt-6 border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                Course category
                <Button onClick={toggleEdit} variant='ghost'>
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className='h-4 w-4 mr-2' />
                            Edit category
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p
                    className={cn(
                        'text-sm mt-2',
                        !initialData.category_id && 'text-slate-500 italic',
                    )}
                >
                    {selectedOption?.label || 'No category'}
                </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 mt-4'
                    >
                        <FormField
                            control={form.control}
                            name='category_id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Combobox
                                            options={options}
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
