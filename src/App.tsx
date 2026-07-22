import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login/Login";
import { BusinessProvider } from "./business/context/BusinessContext";
import { AppProvider } from "./context/AppContext";
import { canAccess, getUserRole } from "./lib/preferences";
import { getAuthToken } from "./lib/auth";
import WorkspaceSkeleton from "./components/ui-v2/WorkspaceSkeleton";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Workday = lazy(() => import("./pages/Workday/Workday"));
const Tasks = lazy(() => import("./pages/Tasks/Tasks"));
const Sites = lazy(() => import("./pages/Sites/Sites"));
const Fleet = lazy(() => import("./pages/Fleet/Fleet"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Plans = lazy(() => import("./pages/Plans/Plans"));
const Team = lazy(() => import("./pages/Team/Team"));
const Employees = lazy(() => import("./pages/Employees/Employees"));
const Analytics = lazy(() => import("./pages/Analytics/Analytics"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const CommandCenter = lazy(
  () => import("./pages/CommandCenter/CommandCenter")
);
const LiveMap = lazy(() => import("./pages/LiveMap/LiveMap"));
const AICopilot = lazy(() => import("./features/ai/AICopilot"));
const BusinessHub = lazy(
  () => import("./business/pages/BusinessHub")
);

function App() {
  const isLoggedIn = localStorage.getItem("nexora_logged_in") === "true" && Boolean(getAuthToken());

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <AppProvider>
        <BusinessProvider>
          <MainLayout>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/work" element={<Guard path="/work"><Workday /></Guard>} />
                <Route path="/command" element={<Guard path="/command"><CommandCenter /></Guard>} />
                <Route path="/map" element={<Guard path="/map"><LiveMap /></Guard>} />
                <Route path="/tasks" element={<Guard path="/tasks"><Tasks /></Guard>} />
                <Route path="/sites" element={<Guard path="/sites"><Sites /></Guard>} />
                <Route path="/business" element={<Guard path="/business"><BusinessHub /></Guard>} />
                <Route path="/fleet" element={<Guard path="/fleet"><Fleet /></Guard>} />
                <Route path="/employees" element={<Guard path="/employees"><Employees /></Guard>} />
                <Route path="/analytics" element={<Guard path="/analytics"><Analytics /></Guard>} />
                <Route path="/reports" element={<Guard path="/reports"><Reports /></Guard>} />
                <Route path="/ai" element={<Guard path="/ai"><AICopilot /></Guard>} />
                <Route path="/settings" element={<Guard path="/settings"><Settings /></Guard>} />
                <Route path="/plans" element={<Guard path="/plans"><Plans /></Guard>} />
                <Route path="/team" element={<Guard path="/team"><Team /></Guard>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BusinessProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

function Guard({ path, children }: { path: string; children: ReactNode }) {
  return canAccess(getUserRole(), path) ? children : <Navigate to="/" replace />;
}

function RouteFallback() {
  return <WorkspaceSkeleton />;
}

export default App;
