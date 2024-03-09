'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { BASE_URL } from '@/lib/config';
import { Loader2 } from 'lucide-react';

const ConfirmPage = () => {
    const router = useRouter();
    const { authToken, handleCookies } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();

    const confirmToken = searchParams.get('confirm_token');
    const decodedToken = confirmToken && jwt.decode(confirmToken);

    const onSubmit = useCallback(async () => {
        setIsLoading(true);

        const response = await axios.post(`${BASE_URL}/auth/active-email`, {
            token: confirmToken,
        });

        if (response.data) {
            handleCookies(response.data);
        }
    }, [confirmToken, handleCookies]);

    useEffect(() => {
        if (decodedToken) {
            const fetchData = async () => await onSubmit();
            fetchData();
        }

        if (authToken?.access_token) {
            router.refresh();
            router.push('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken?.access_token, router]);

    if (!decodedToken || authToken?.access_token) {
        router.push('/sign-in');
        return null;
    }

    return (
        <div>
            {isLoading && (
                <div className='bg-black/20 backdrop-blur-[2px] h-full w-full inset-0 absolute z-50 flex items-center justify-center transition select-none'>
                    <Loader2 className='w-10 h-10 animate-spin text-blue-400' />
                </div>
            )}
        </div>
    );
};

export default ConfirmPage;
