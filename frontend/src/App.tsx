import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { HouseholdPage } from "./pages/HouseholdPage";
import { LoginPage } from "./pages/LoginPage";
import { ChoresPage } from "./pages/ChoresPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage mode="login" />} />
          <Route path="/register" element={<LoginPage mode="register" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/household" element={<HouseholdPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chores" element={<ChoresPage />} />
            <Route path="/calendar" element={<PlaceholderPage title="Kalender" />} />
            <Route path="/approvals" element={<PlaceholderPage title="Approvals" />} />
            <Route path="/stats" element={<PlaceholderPage title="Stats" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
