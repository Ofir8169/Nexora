import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
import Sites from "./pages/Sites/Sites";
import CommandCenter from "./pages/CommandCenter/CommandCenter";
import Fleet from "./pages/Fleet/Fleet";
import Settings from "./pages/Settings/Settings";
import Employees from "./pages/Employees/Employees";
import Analytics from "./pages/Analytics/Analytics";
import Reports from "./pages/Reports/Reports";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;