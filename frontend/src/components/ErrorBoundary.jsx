import React from "react";
import { withTranslation } from "react-i18next";
import { RefreshCw, WifiOff } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.name === "ChunkLoadError" ||
        this.state.error?.message?.includes("Loading chunk") ||
        this.state.error?.message?.includes("dynamically imported module");
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-md p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {isChunkError ? t("errorBoundary.connectionLost") : t("errorBoundary.somethingWentWrong")}
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              {isChunkError ? t("errorBoundary.connectionLostMessage") : t("errorBoundary.somethingWentWrongMessage")}
            </p>
            <button onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 cursor-pointer hover:-translate-y-0.5">
              <RefreshCw className="w-4 h-4" />{t("errorBoundary.reloadPage")}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);