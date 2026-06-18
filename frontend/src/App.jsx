import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useContext } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import BookingSuccess from "./pages/BookingSuccess";
import { AuthContext } from "./context/AuthContext";
import { AdminAuthContext } from "./context/AdminAuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminEventSeats from "./pages/admin/AdminEventSeats";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useContext(AdminAuthContext);
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const AppShell = () => {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell min-h-screen">
      {!isAdminArea ? <Navbar /> : null}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/create" element={<AdminEventForm />} />
            <Route path="events/:id/edit" element={<AdminEventForm />} />
            <Route path="events/:id/seats" element={<AdminEventSeats />} />
          </Route>

          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
