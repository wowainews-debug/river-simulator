import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignalsPage from "./pages/Signals";
import SignalDetail from "./pages/SignalDetail";
import OrdersPage from "./pages/Orders";
import StockPosition from "./pages/StockPosition";
import FuturesPage from "./pages/Futures";
import OptionsPage from "./pages/Options";
import ParamPanel from "./pages/ParamPanel";
import SettingsPage from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/signals/:symbol" element={<SignalDetail />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/positions/stock/:symbol" element={<StockPosition />} />
        <Route path="/positions/futures" element={<FuturesPage />} />
        <Route path="/positions/options" element={<OptionsPage />} />
        <Route path="/params/:symbol" element={<ParamPanel />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
