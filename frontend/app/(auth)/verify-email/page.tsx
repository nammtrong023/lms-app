'use client';

import axios from 'axios';
import * as z from 'zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSignIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { BASE_URL } from '@/lib/config';

const formSchema = z.object({
    email: z.string().min(1, 'Enter your email').email('Email is not valid'),
});

type VerifyEmailForm = z.infer<typeof formSchema>;

const baseUrl = `${BASE_URL}/auth/verify-email`;

const VerifyEmailPage = () => {
    const form = useForm<VerifyEmailForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    });

    const { mutate, isSuccess, isPending } = useMutation({
        mutationKey: ['verify-email'],
        mutationFn: async (value: VerifyEmailForm) => {
            await axios.post(baseUrl, value);
        },
        onError: (error) => {
            toast.error('Email not found');
        },
    });

    const { email } = form.getValues();

    useEffect(() => {}, [email]);

    const onSubmit = (value: VerifyEmailForm) => {
        mutate(value);
    };

    return (
        <>
            {!isSuccess && (
                <div className='flex flex-col items-center justify-center gap-y-[10px]'>
                    <h1 className='font-bold text-lg lg:text-3xl'>
                        Forgot password
                    </h1>
                </div>
            )}
            <div className='bg-white relative dark:bg-[#212833] rounded-[20px] p-10 w-full flex flex-col gap-y-5'>
                {isSuccess ? (
                    <div className='flex flex-col items-center justify-center gap-y-[10px]'>
                        <h1 className='font-bold text-lg lg:text-3xl'>
                            Please check your email
                        </h1>
                        <p className='font-medium text-sm lg:text-base text-center'>
                            An email with a reset password is sent to:{' '}
                            <span className='text-blueFF'>{email}</span>
                        </p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            method='post'
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='w-full relative'>
                                        <AtSignIcon className='w-4 h-4 absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                        <Input
                                            className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm bg-transparent dark:bg-dark2'
                                            placeholder='Your email'
                                            disabled={isPending}
                                            {...field}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type='submit'
                                variant='secondary'
                                disabled={isPending}
                                className='w-full h-10 lg:h-[52px] rounded-md lg:rounded-[10px] mt-[30px] text-sm md:text-base'
                            >
                                Send
                            </Button>
                        </form>
                    </Form>
                )}
                {!isSuccess && (
                    <div className='text-sm md:text-base text-gray78 dark:text-white font-medium mt-[30px] text-center'>
                        <Link href='/sign-in' className='ml-4 text-[#377DFF]'>
                            Back to sign in
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default VerifyEmailPage;
