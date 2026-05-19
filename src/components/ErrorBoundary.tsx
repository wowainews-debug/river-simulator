import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 🛡️ 全應用 ErrorBoundary — 攔截子元件渲染例外，防止整個頁面白屏/卡死
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] 攔截到元件渲染錯誤:", error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border border-rose-200 rounded-xl p-8 max-w-lg w-full text-center space-y-4 shadow-lg">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-lg font-semibold text-slate-900">元件渲染異常</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {this.state.error?.message || "發生未預期的錯誤，請嘗試重新整理頁面。"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                🔄 嘗試恢復
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                🔃 重新整理
              </button>
            </div>
            <details className="text-left mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer">錯誤詳細資訊</summary>
              <pre className="mt-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-lg overflow-auto max-h-40">
                {this.state.error?.stack || "無堆疊追蹤"}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
