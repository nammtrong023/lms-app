'use client';

import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { SearchInput } from './search-input';
import { ProfileDropdown } from './profile-dropdown';

export const NavbarRoutes = () => {
    const pathname = usePathname();
    const isSearchPage = pathname === '/search';

    return (
        <>
            {isSearchPage && (
                <div className='hidden md:block'>
                    <SearchInput />
                </div>
            )}
            <div className='flex gap-x-2 ml-auto mr-4'>
                <Link href='/'>
                    <Button size='sm' variant='ghost'>
                        <LogOut className='h-4 w-4 mr-2' />
                        Exit
                    </Button>
                </Link>
                <ProfileDropdown />
            </div>
        </>
    );
};
