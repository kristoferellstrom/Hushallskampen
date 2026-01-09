import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.scss";
import { AuthProvider } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { HouseholdPage } from "./pages/HouseholdPage";
import { LoginPage } from "./pages/LoginPage";
import { ChoresPage } from "./pages/ChoresPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { StatsPage } from "./pages/StatsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const HomeRedirect = () => {
  const { token, user, loading } = useAuth();
  if (loading) return <p className="status">Laddar...</p>;
  if (!token) return <Navigate to="/login" replace />;
  return user?.householdId ? <Navigate to="/dashboard" replace /> : <Navigate to="/household" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage mode="login" />} />
          <Route path="/register" element={<LoginPage mode="register" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/household" element={<HouseholdPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chores" element={<ChoresPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
