import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import Layout from "scenes/layout";
import Overview from "scenes/overview";
import MapAndTraffic from "scenes/mapsAndTraffic";
import Settings from "scenes/settings";
import UserManagement from "scenes/userManagement";
import Reports from "scenes/Reports";
import SystemLogsAndSecurity from "scenes/systemLogsAndSecurity";
import TripAnalytics from "scenes/tripAnalytics";
import AddMotor from "scenes/addMotor";
import UserMotor from "scenes/userMotor";
import GasStations from "scenes/gasStations";
import LoginForm from "components/LoginForm";
import ProtectedRoute from "components/ProtectedRoute";
import AdminManagement from "scenes/adminManagement";
import AdminLogs from "scenes/adminLogs";
import AdminDashboard from "scenes/adminDashboard"; // NEW
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "contexts/AuthContext";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const isLoggedIn = useSelector((state) => state.global.isLoggedIn);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={isLoggedIn ? <Navigate to="/overview" replace /> : <LoginForm />} 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/overview" replace />} />
                  <Route path="overview" element={<Overview />} />
                  <Route path="UserManagement" element={<UserManagement />} />
                  <Route path="TripAnalytics" element={<TripAnalytics />} />
                  <Route path="MapsAndTraffic" element={<MapAndTraffic />} />
                  <Route path="Reports" element={<Reports />} />
                  <Route path="SystemLogsAndSecurity" element={<SystemLogsAndSecurity />} />
                  <Route path="Settings" element={<Settings />} />
                  <Route path="addMotor" element={<AddMotor />} />
                  <Route path="userMotor" element={<UserMotor />} />
                  <Route path="gasStations" element={<GasStations />} />
                  <Route path="adminManagement" element={<AdminManagement />} />
                  <Route path="adminLogs" element={<AdminLogs />} />
                  <Route path="adminDashboard" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </ThemeProvider>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;