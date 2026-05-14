import TopNavBar from "../components/TopNavBar";
import FundManager from "../components/FundManager";
import SignalSection from "../components/SignalSection";
import EquityCurveChart from "../components/EquityCurveChart";

const SECTIONS = [
  { assetType: "stock", label: "📈 個股", count: 5, color: "blue" },
  { assetType: "futures", label: "📉 期貨 (微台指)", count: 1, color: "amber" },
  { assetType: "options", label: "📊 選擇權", count: 0, color: "purple" },
] as const;

export default function Dashboard() {
  return (
    <div className="bg-white min-h-screen">
      <TopNavBar />
      <main className="max-w-7xl mx-auto py-4">
        <FundManager />
        {SECTIONS.map(s => <SignalSection key={s.assetType} {...s} />)}
        <div className="px-4 mt-6"><EquityCurveChart /></div>
      </main>
    </div>
  );
}
