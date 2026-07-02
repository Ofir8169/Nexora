import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
import Sites from "./pages/Sites/Sites";
import Fleet from "./pages/Fleet/Fleet";
import Reports from "./pages/Reports/Reports";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;