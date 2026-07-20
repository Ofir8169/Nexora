import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login/Login";
import { BusinessProvider } from "./business/context/BusinessContext";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
import Sites from "./pages/Sites/Sites";
import Fleet from "./pages/Fleet/Fleet";
import Settings from "./pages/Settings/Settings";
import Employees from "./pages/Employees/Employees";
import Analytics from "./pages/Analytics/Analytics";
import Reports from "./pages/Reports/Reports";
import CommandCenter from "./pages/CommandCenter/CommandCenter";
import LiveMap from "./pages/LiveMap/LiveMap";
import AICopilot from "./features/ai/AICopilot";

function App() {
  const isLoggedIn = localStorage.getItem("nexora_logged_in") === "true";

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/command" element={<CommandCenter />} />
          <Route path="/map" element={<LiveMap />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/business" element={<BusinessProvider><></></BusinessProvider>} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai" element={<AICopilot />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;