import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import ResponsiveAppBar from "./components/ResponsiveAppBar";

// Lazy load components for code splitting
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/Login"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const FamilyMemberLog = lazy(() => import("./components/FamilyMemberLog"));
const AddVaccine = lazy(() => import("./components/AddVaccine"));
const ViewRecord = lazy(() => import("./components/ViewRecord"));

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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet />
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes without navigation */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes with navigation */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/familyMemberLog" element={<FamilyMemberLog />} />
          <Route path="/addVaccine" element={<AddVaccine />} />
          <Route path="/viewRecord" element={<ViewRecord />} />

          {/* Redirect /home to / */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* 404 catch-all */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
