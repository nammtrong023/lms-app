'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import axios from 'axios';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { AtSignIcon, Loader2, Lock, Smile } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '@/lib/config';

const formSchema = z.object({
    username: z.string().min(5, 'At least 5 characters'),
    password: z.string().min(6, 'At least 6 characters'),
    email: z.string().min(1, 'Enter your email').email('Email is not valid'),
});

type RegisterFormType = z.infer<typeof formSchema>;

const RegisterPage = () => {
    const router = useRouter();

    const { setEmailSignUp } = useAuth();

    const form = useForm<RegisterFormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    const {
        mutate: signUp,
        isSuccess,
        isPending,
    } = useMutation({
        mutationFn: async (values: RegisterFormType) => {
            return await axios.post(`${BASE_URL}/auth/register`, values);
        },
        onSuccess: () => {
            toast.success('Success');
        },
        onError: (error) => {
            toast.error('Email is not valid!');
        },
    });

    const onSubmit = async (values: RegisterFormType) => {
        signUp(values);
    };

    useEffect(() => {
        const emailValue = form.getValues('email');

        if (isSuccess) {
            setEmailSignUp(emailValue);
            router.refresh();
        }
    }, [form, isSuccess, router, setEmailSignUp]);

    return (
        <>
            <div className='flex flex-col items-center justify-center gap-y-[10px]'>
                <h1 className=' font-bold text-lg lg:text-3xl'>
                    {!isSuccess ? 'Sign up' : 'Verify email'}
                </h1>
                {isSuccess && (
                    <p className='font-medium text-sm lg:text-base text-center'>
                        Please check your email.
                    </p>
                )}
            </div>
            <div className='bg-white rounded-[20px] p-6 lg:p-10 flex flex-col gap-y-5 lg:gap-y-[30px] w-full'>
                {isPending && (
                    <div className='bg-white/20 backdrop-blur-[2px] rounded-[20px] h-full w-full inset-0 absolute z-50 flex items-center justify-center transition select-none'>
                        <Loader2 className='w-10 h-10 animate-spin' />
                    </div>
                )}

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
                            {/* EMAIL */}
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='w-full relative'>
                                        <AtSignIcon className='w-4 h-4 absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                        <FormControl>
                                            <Input
                                                className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm bg-transparent'
                                                placeholder='Your email'
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* NAME */}
                            <FormField
                                control={form.control}
                                name='username'
                                render={({ field }) => (
                                    <FormItem className='w-full relative'>
                                        <Smile
                                            className='w-4 h-4 absolute left-5 top-[11px] lg:top-[19px]
                                        font-bold'
                                        />
                                        <FormControl>
                                            <Input
                                                className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm'
                                                placeholder='Your username'
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
                                        <Lock className='w-4 h-4  absolute left-5 top-[11px] lg:top-[19px] font-bold' />
                                        <FormControl>
                                            <Input
                                                placeholder='Your password'
                                                type='password'
                                                className='h-10 lg:h-[52px] rounded-md lg:rounded-[10px] pl-11 !m-0 text-sm'
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                disabled={isPending}
                                type='submit'
                                variant='secondary'
                                className='w-full h-10 lg:h-[52px] rounded-md lg:rounded-[10px] text-sm md:text-base'
                            >
                                Sign up
                            </Button>
                        </form>
                    </Form>
                )}

                {!isSuccess && (
                    <div className='flex items-center justify-center text-sm md:text-base font-medium mt-[30px]'>
                        Already have an account?
                        <Link href='/sign-in' className='ml-2 text-[#377DFF]'>
                            Sign in
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default RegisterPage;
