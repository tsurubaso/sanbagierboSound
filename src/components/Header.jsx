import { NavLink } from "react-router-dom";

export default function Header() {
  const linkStyle = ({ isActive }) =>
    `px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700"
    }`;

  return (
    <div className="w-full p-4 bg-gray-800 flex gap-3 text-white text-lg font-semibold">
      <NavLink to="/" className={linkStyle} end>
        Home
      </NavLink>
      <NavLink to="/basic" className={linkStyle}>
        Basic
      </NavLink>
      <NavLink to="/option" className={linkStyle}>
        Options
      </NavLink>

      <NavLink to="/events" className={linkStyle}>
        Events
      </NavLink>

      <NavLink to="/plugins" className={linkStyle}>
        Plugins
      </NavLink>

      <NavLink to="/other" className={linkStyle}>
        Other Libraries
      </NavLink>
    </div>
  );
}
