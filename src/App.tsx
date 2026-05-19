import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import TopNavBar from "./components/TopNavBar";
import Dashboard from "./pages/Dashboard";
import SignalsPage from "./pages/Signals";
import SignalDetail from "./pages/SignalDetail";
import OrdersPage from "./pages/Orders";
import StockPosition from "./pages/StockPosition";
import FuturesPage from "./pages/Futures";
import OptionsPage from "./pages/Options";
import ParamPanel from "./pages/ParamPanel";
import SettingsPage from "./pages/Settings";
import SystemStatusPage from "./pages/SystemStatus";
import ComputeStocks from "./pages/ComputeStocks";
import DebateMonitor from "./pages/DebateMonitor";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="bg-slate-50 min-h-screen">
          <TopNavBar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/signals" element={<SignalsPage />} />
              <Route path="/compute/stocks" element={<ComputeStocks />} />
              <Route path="/signals/:symbol" element={<SignalDetail />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/positions/stock/:symbol" element={<StockPosition />} />
              <Route path="/positions/futures" element={<FuturesPage />} />
              <Route path="/positions/options" element={<OptionsPage />} />
              <Route path="/params/:symbol" element={<ParamPanel />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/status" element={<SystemStatusPage />} />
              <Route path="/status/debate" element={<DebateMonitor />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
