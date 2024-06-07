import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
    return (
        <>
            <main className='container mx-auto mt-5 md:mt-2 p-1 md:flex md:justify-center'>
                <div className='md:w-3/4 lg:w-2/5'>
                    <Outlet/>
                </div>
            </main>
        </>
    )
}

export default AuthLayout