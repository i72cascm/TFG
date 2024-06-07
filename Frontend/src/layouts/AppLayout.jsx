import { Outlet } from 'react-router-dom'
import Sidebar from '../components/appLayer/Sidebar'

const AppLayout = () => {
    return (
        <>
            <div className="flex">
                <div className='sticky top-0 h-full'>
                    <Sidebar />
                </div>
                <div className="flex-grow overflow-auto">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default AppLayout