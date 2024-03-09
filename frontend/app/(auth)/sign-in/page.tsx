'use client';
import Link from 'next/link';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AtSignIcon, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { useAuthApi } from '@/hooks/use-auth-api';

const formSchema = z.object({
    email: z.string().min(1, 'Enter your email').email('Email is not valid'),
    password: z.string().min(6, 'At least 6 characters'),
});

export type LoginFormType = z.infer<typeof formSchema>;

const LoginPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { login } = useAuthApi();
    const { handleCookies } = useAuth();

    const form = useForm<LoginFormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const { data, mutate, isSuccess, isPending } = useMutation({
        mutationFn: (values: LoginFormType) => login(values),
        onError: (error: Error) => {
            toast.error('Incorrect email or password');
        },
    });

    const onSubmit = (values: LoginFormType) => {
        mutate(values);
    };

    useEffect(() => {
        if (isSuccess) {
            handleCookies(data);
            queryClient.invalidateQueries();
            router.refresh();
            router.push('/');
        }
    }, [data, router, queryClient, isSuccess, handleCookies]);

    return (
        <>
            <div className='flex flex-col items-center justify-center gap-y-[10px]'>
                <h1 className='text-gray78 font-bold text-lg lg:text-3xl'>
                    Sign in
                </h1>
            </div>
            <div className='bg-white relative rounded-[20px] p-10 w-full flex flex-col gap-y-5 lg:gap-y-[30px]'>
                {isPending && (
                    <div className='bg-white/20 backdrop-blur-[2px] rounded-[20px] h-full w-full inset-0 absolute z-50 flex items-center justify-center transition select-none'>
                        <Loader2 className='w-10 h-10 animate-spin' />
                    </div>
                )}

                <Form {...form}>
                    <form
                        method='post'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='flex flex-col w-full space-y-5'
                    >
                        {/* EMAIL */}
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem className='w-full relative'>
                                    <AtSignIcon className='w-4 h-4 text-gray78 absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                    <FormControl>
                                        <Input
                                            className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm bg-transparent border-[#4E5D78]'
                                            placeholder='Your email'
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem className='w-full relative'>
                                    <Lock className='w-4 h-4 text-gray78 absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                    <FormControl>
                                        <Input
                                            placeholder='Your password'
                                            className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm bg-transparent border-[#4E5D78]'
                                            disabled={isPending}
                                            type='password'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='w-full text-right'>
                            <Link
                                href='/verify-email'
                                className='font-medium text-sm w-fit'
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Button
                            disabled={isPending}
                            type='submit'
                            variant='secondary'
                            className='w-full h-10 lg:h-[52px] rounded-md lg:rounded-[10px] mt-[30px] text-sm md:text-base'
                        >
                            Sign in
                        </Button>
                    </form>
                </Form>

                <div className='text-sm md:text-base font-medium mt-[30px] text-center'>
                    Do not have an account?
                    <Link href='/sign-up' className='ml-2 text-[#377DFF]'>
                        Sign up
                    </Link>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
