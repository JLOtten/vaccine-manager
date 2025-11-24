import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Lazy load components for code splitting
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/Login"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const FamilyMemberLog = lazy(() => import("./components/FamilyMemberLog"));
const AddVaccine = lazy(() => import("./components/AddVaccine"));
const ViewRecord = lazy(() => import("./components/ViewRecord"));

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout component that includes navigation
function Layout() {
  return (
    <>
      <ResponsiveAppBar />
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </>
  );
}

// Layout without navigation (for login)
function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet />
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes without navigation */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected routes with navigation */}
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/familyMemberLog"
          element={
            <ProtectedRoute>
              <FamilyMemberLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addVaccine"
          element={
            <ProtectedRoute>
              <AddVaccine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewRecord"
          element={
            <ProtectedRoute>
              <ViewRecord />
            </ProtectedRoute>
          }
        />

        {/* Redirect /home to / */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* 404 catch-all */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
