'use client';

import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/config';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { User } from '@/types';
import Link from 'next/link';
import { useAuth } from './providers/auth-provider';

export function ProfileDropdown() {
    const axiosPrivate = useAxiosPrivate();
    const { logout } = useAuth();

    const { data } = useQuery({
        queryKey: ['get-current-user'],
        queryFn: async () => {
            const response = await axiosPrivate.get(
                `${BASE_URL}/auth/current-user`,
            );

            return response.data as User;
        },
    });

    if (!data) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className='cursor-pointer'>
                <Avatar>
                    <AvatarFallback className='capitalize text-lg'>
                        {data.username[0]}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
                <DropdownMenuLabel>{data.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href='/teacher/courses'>
                    <DropdownMenuItem className='cursor-pointer'>
                        Teacher mode
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    onClick={() => logout()}
                    className='cursor-pointer'
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
