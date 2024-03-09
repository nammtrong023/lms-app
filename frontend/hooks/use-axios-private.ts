'use client';

import dayjs from 'dayjs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { useAuth } from '@/components/providers/auth-provider';
import { BASE_URL } from '@/lib/config';

const useAxiosPrivate = () => {
    const { authToken, handleCookies } = useAuth();

    const axiosPrivate = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken?.access_token}`,
        },
    });

    axiosPrivate.interceptors.request.use(async (req) => {
        const user: any =
            authToken?.access_token && jwt.decode(authToken?.access_token);

        const currentTime = dayjs();
        const expirationTime = dayjs.unix(user.exp);

        const timeUntilExpire = expirationTime.diff(currentTime, 'minutes');

        const isExpired = timeUntilExpire < 5;

        if (!isExpired) return req;

        // const { data } = await axios.post(`${baseURL}/auth/refresh`, null, {
        //     headers: {
        //         Authorization: `Bearer ${authToken?.refreshToken}`,
        //     },
        // });

        // handleCookies(data);
        // req.headers.Authorization = `Bearer ${data.access_token}`;

        return req;
    });

    return axiosPrivate;
};

export default useAxiosPrivate;
