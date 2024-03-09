import { Logo } from '../(dashboard)/_components/logo';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='min-h-screen py-8 px-8 bg-gray-100 space-y-32'>
            <div className='flex items-start'>
                <Logo />
            </div>
            <div className='flex flex-col items-center justify-center gap-y-8 mx-auto min-w-[320px] w-full max-w-[580px]'>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
