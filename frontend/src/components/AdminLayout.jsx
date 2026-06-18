import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => (
  <div className="min-h-[calc(100vh-72px)] bg-slate-100 text-slate-900">
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <main className="p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;
