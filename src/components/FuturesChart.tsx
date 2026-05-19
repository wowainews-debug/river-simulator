import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi } from "lightweight-charts";

interface KlineItem {
  time: number;   // UNIX timestamp (秒)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  klines: KlineItem[];
}

interface Props {
  data?: ChartData;
}

export default function FuturesChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // 初始化圖表（僅一次，不因 data 變更而重建）
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth || 800;

    const chart = createChart(container, {
      layout: { background: { type: ColorType.Solid, color: "white" }, textColor: "#334155" },
      width: w,
      height: 500,
      grid: { vertLines: { color: "#f1f5f9" }, horzLines: { color: "#f1f5f9" } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444", downColor: "#10b981",
      borderUpColor: "#ef4444", borderDownColor: "#10b981",
      wickUpColor: "#ef4444", wickDownColor: "#10b981",
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;

    return () => {
      try { chart.remove(); } catch { /* ignore */ }
      chartRef.current = null;
      candleRef.current = null;
    };
  }, []);

  // 資料更新：原地 setData，不重建圖表
  useEffect(() => {
    if (!candleRef.current || !data?.klines.length) return;
    (candleRef.current as any).setData(data.klines);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  if (!data?.klines.length) {
    return <div className="text-center text-slate-400 py-10">尚無 K 線數據</div>;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">📈 台指期即時走勢</h3>
      <div ref={containerRef} className="w-full rounded-xl border border-slate-200 overflow-hidden" style={{ minHeight: 500 }} />
    </div>
  );
}
