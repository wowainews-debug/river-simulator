import { AdvancedChart } from "react-tradingview-embed";

export default function TradingViewWidget() {
  return (
    <div className="h-96">
      <AdvancedChart
        widgetProps={{
          symbol: "TWSE:2330",
          interval: "D",
          theme: "light",
          style: "1",
          toolbar_bg: "#f8fafc",
          hide_side_toolbar: false,
          allow_symbol_change: true,
          locale: "zh_TW",
        }}
      />
    </div>
  );
}
