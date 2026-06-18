import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import { AdminAuthContext } from "../../context/AdminAuthContext";

const AdminLogin = () => {
  const { login } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Use the manually inserted admin account.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Admin email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <ErrorMessage message={error} />
          <button
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Admin Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
