import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"
  }`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-lg font-bold text-white shadow-glow">
            S
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">SortMyScene</div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Ticket booking</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-500 md:inline">Hi, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:opacity-95"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
