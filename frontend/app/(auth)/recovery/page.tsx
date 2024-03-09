'use client';

import * as z from 'zod';
import jwt from 'jsonwebtoken';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import axios from 'axios';
import { BASE_URL } from '@/lib/config';
import { Tokens } from '@/types';

const formSchema = z.object({
    password: z.string().min(6, 'At least 6 characters'),
    confirm_password: z.string().min(6, 'At least 6 characters'),
});

export type VerifyEmailForm = z.infer<typeof formSchema>;

const PasswordRecoveryPage = () => {
    const router = useRouter();
    const { authToken, handleCookies } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const recovery_token = searchParams.get('recovery_token');

    const decodedToken = recovery_token && jwt.decode(recovery_token);

    const form = useForm<VerifyEmailForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirm_password: '',
        },
    });

    const { data, mutate, isSuccess } = useMutation({
        mutationKey: ['confirm-password'],
        mutationFn: async (values: VerifyEmailForm) => {
            const response = await axios.post(
                `${BASE_URL}/auth/password-recovery?recovery_token=${recovery_token}`,
                values,
            );

            return response.data as Tokens;
        },
        onError: () => setIsLoading(false),
    });

    useEffect(() => {
        if (isSuccess) {
            handleCookies(data);
        }

        if (isSuccess && authToken?.access_token) {
            router.refresh();
            router.push('/');
        }
    }, [router, authToken?.access_token, isSuccess, handleCookies, data]);

    if (!decodedToken || authToken?.access_token) {
        return redirect('/sign-in');
    }

    const onSubmit = (value: VerifyEmailForm) => {
        const { password, confirm_password } = value;

        if (password !== confirm_password) {
            return toast.error('Password does not match!');
        }

        setIsLoading(true);
        const data = {
            password,
            confirm_password,
        };
        mutate(data);
    };

    return (
        <>
            <div className='flex flex-col items-center justify-center gap-y-[10px]'>
                <h1 className=' font-bold text-lg lg:text-3xl'>
                    Password recovery
                </h1>
            </div>
            <div className='bg-white dark:bg-[#212833] rounded-[20px] p-6 lg:p-10 flex flex-col gap-y-5 lg:gap-y-[30px] w-full'>
                {isSuccess ? (
                    <div className='flex flex-col items-center justify-center gap-y-[10px]'>
                        <h1 className='font-bold text-lg lg:text-3xl'>
                            Please check your email
                        </h1>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            method='post'
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='flex flex-col w-full space-y-5'
                        >
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='w-full relative'>
                                        <Lock className='w-4 h-4  absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                        <FormControl>
                                            <Input
                                                className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm bg-transparent dark:bg-dark2'
                                                placeholder='New password'
                                                type='password'
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='confirm_password'
                                render={({ field }) => (
                                    <FormItem className='w-full relative'>
                                        <Lock className='w-4 h-4  absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                        <FormControl>
                                            <Input
                                                placeholder='Confirm password'
                                                type='password'
                                                className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm dark:bg-dark2'
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                disabled={isLoading}
                                variant='secondary'
                                type='submit'
                                className='w-full h-10 lg:h-[52px] rounded-md lg:rounded-[10px] text-sm md:text-base flex items-center justify-center gap-x-2'
                            >
                                {isLoading && (
                                    <Loader2 className='w-[22px] h-[22px] animate-spin' />
                                )}
                                Confirm
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </>
    );
};

export default PasswordRecoveryPage;
