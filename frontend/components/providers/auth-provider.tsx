'use client';

import { Tokens } from '@/types';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';
import React, { createContext, useCallback, useContext, useState } from 'react';

type ContextDataType = {
    currentUserId: number | undefined;
    authToken: Tokens | undefined;
    emailSignUp: string;
    setEmailSignUp: (email: string) => void;
    handleCookies: (data: Tokens) => void;
    setAuthToken: (authToken: Tokens) => void;
    setCurrentUserId: (currentUserId: number | undefined) => void;
    logout: () => void;
};

const access_token = getCookie('access_token')?.valueOf() || '';

const AuthContext = createContext<ContextDataType>({
    currentUserId: 0,
    authToken: {
        access_token,
        token_type: 'bearer',
    },
    emailSignUp: '',
    setEmailSignUp: () => {},
    handleCookies: () => {},
    setAuthToken: () => {},
    setCurrentUserId: () => {},
    logout: () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    const [currentUserId, setCurrentUserId] = useState<number | undefined>();
    const [emailSignUp, setEmailSignUp] = useState('');

    const [authToken, setAuthToken] = useState<Tokens | undefined>({
        access_token,
        token_type: 'bearer',
    });

    const handleCookies = useCallback(
        (data: Tokens) => {
            setCookie('access_token', data?.access_token);

            setAuthToken({
                access_token: data?.access_token,
                token_type: 'bearer',
            });
        },
        [setAuthToken],
    );

    const logout = () => {
        setCurrentUserId(undefined);
        setAuthToken(undefined);
        setCookie('access_token', '');
        router.push('/sign-in');
    };

    const contextData = {
        authToken,
        currentUserId,
        emailSignUp,
        setEmailSignUp,
        setAuthToken,
        handleCookies,
        logout,
        setCurrentUserId,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
