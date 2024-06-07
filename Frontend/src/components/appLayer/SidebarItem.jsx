import { useContext } from "react";
import { Link } from "react-router-dom";
import { SidebarContext } from "./Sidebar";

export function SidebarItem({ icon, text, active, to }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <Link to={to}>
      <li
        className={`relative flex text-center items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer h-12 transition-colors group ${
          active
            ? "bg-gradient-to-tr from-indigo-400 to-indigo-200 text-indigo-800"
            : "bg-gray-200 hover:bg-indigo-50 text-gray-600"
        }`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        
        {!expanded && (
          <div
            className={`absolute left-full rounded-xl px-2 py-1 ml-6 bg-indigo-200 text-indigo-800 text-xs invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}
