import KpiCard from "./KpiCard";

export default function KpiDashboard() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="總權益數" value="$1,245,000" />
        <KpiCard title="今日損益" value="+$12,500" change="▲1.2%" isPositive={true} />
        <KpiCard title="持倉數量" value="3 檔" />
        <KpiCard title="累積勝率" value="68.5%" />
      </div>
    </div>
  );
}
