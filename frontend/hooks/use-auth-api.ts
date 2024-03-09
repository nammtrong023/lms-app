import { LoginFormType } from '@/app/(auth)/sign-in/page';
import { BASE_URL } from '@/lib/config';
import { Tokens } from '@/types';
import axios from 'axios';

const baseUrl = `${BASE_URL}/auth`;

export const useAuthApi = () => {
    // const resetPassword = async (value: VerifyEmailForm) => {
    //     const response = await axios.post(`${baseUrl}/reset-password`, value);
    //     return response.data as Tokens;
    // };

    const login = async (values: LoginFormType) => {
        const response = await axios.post(`${baseUrl}/login`, values);
        return response.data as Tokens;
    };

    return { login };
};
