import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => {
    return (
        <Link href='/' className='flex items-center justify-center gap-x-2'>
            <Image height={50} width={50} alt='logo' src='/logo.svg' />
            <h2 className='text-2xl font-medium text-black'>PulseLMS</h2>
        </Link>
    );
};
