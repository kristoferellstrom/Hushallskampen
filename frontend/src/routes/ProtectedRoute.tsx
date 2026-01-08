import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  if (loading) return <p className="status">Laddar...</p>;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};
