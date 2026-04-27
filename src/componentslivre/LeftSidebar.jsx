import { Link, useLocation } from "react-router-dom";

export default function LeftSidebar({ navItems = [] }) {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <aside className="w-64 bg-black text-white transition-all duration-700 p-4 border-r flex flex-col justify-between">
      <nav className="space-y-2">
        {/* Titre avec favicon */}
        <div className="flex items-center gap-2 mb-6">
          <img
            src="/favicon.ico"
            alt="Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <h2 className="text-2xl font-bold">SanBaGierBo</h2>
        </div>

        {/* Menu de navigation */}
        <ul className="space-y-4">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                to={href} // <-- "href" devient "to"
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  pathname === href ? "bg-gray-700 font-semibold" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
