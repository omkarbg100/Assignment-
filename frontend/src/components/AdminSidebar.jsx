import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";

const adminLinkClass = ({ isActive }) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-white text-slate-900 shadow" : "text-slate-200 hover:bg-white/10 hover:text-white"
  }`;

const AdminSidebar = () => {
  const { admin, logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <aside className="flex h-full flex-col justify-between border-r border-slate-800 bg-slate-950 p-4 text-white">
      <div className="space-y-6">
        <div>
          <div className="text-lg font-bold">Admin Console</div>
          <div className="text-xs text-slate-400">Signed in as {admin?.email}</div>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/dashboard" className={adminLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/events" className={adminLinkClass}>
            Events
          </NavLink>
          <NavLink to="/admin/events/create" className={adminLinkClass}>
            Create Event
          </NavLink>
        </nav>
      </div>
      <button onClick={handleLogout} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/20">
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
