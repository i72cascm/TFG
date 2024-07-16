import { Outlet } from 'react-router-dom'
import Sidebar from '../components/appLayer/Sidebar'

const AppLayout = () => {
    return (
        <>
            <div className="flex">
                <div className='sticky top-0 h-full' style={{zIndex: 1000}}>
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