import { ChevronFirst, ChevronLast } from "lucide-react";
import { createContext, useState } from 'react';
import logo from '/logo.png';
import { SidebarItem } from "./SidebarItem";
import { LifeBuoy, Apple, Home, CookingPot, Receipt, ScrollText, LayoutDashboard, Settings} from "lucide-react"
import { useLocation } from "react-router-dom";

export const SidebarContext = createContext()


export default function Sidebar(){
    const [expanded, setExpanded] = useState(true)
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className='h-screen'>
            <nav className='h-full flex flex-col border-r-2 border-black'
                style={{ backgroundColor: '#393E46'}}>
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img 
                        src={logo}  
                        className={` overflow-hidden transition-all ${
                            expanded ? "w-56" : "w-0"
                        }`}
                    />
                    <div style={{ display: 'flex', alignItems: 'start', height: '100%' }}>
                      <button onClick={() => setExpanded(curr =>!curr)} className='p-1.5 rounded-xl bg-gray-200 hover:bg-gray-200'>
                          {expanded? <ChevronFirst />: <ChevronLast />}
                      </button>   
                    </div>
                    
                </div>
                
                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3"> 
                        <SidebarItem icon={<Home size={25} />} text="Home Page" to="/app/home" active={isActive('/app/home')}/>
                        <SidebarItem icon={<CookingPot size={25}/>} text="Recipe Builder" to="/app/recipe-builder" active={isActive('/app/recipe-builder')}/>
                        <SidebarItem icon={<ScrollText size={25} />} text="My Recipes" to="/app/my-recipes" active={isActive('/app/my-recipes')}/>
                        <SidebarItem icon={<Receipt size={25} />} text="Shopping List"/>
                        <SidebarItem icon={<LayoutDashboard size={25} />} text="Weekly Planner"/>
                        <SidebarItem icon={<Apple size={25} />} text="Healthy Recipes"/>
                        <hr className='my-3' style={{ borderTop: '1px solid #000000' }}/>
                        <SidebarItem icon={<Settings size={25} />} text="User Settings" />
                        <SidebarItem icon={<LifeBuoy size={25} />} text="Help" />    
                    </ul>
                </SidebarContext.Provider>
            </nav>
        </aside>
    )
}