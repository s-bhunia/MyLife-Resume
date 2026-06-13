import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <h1>Something went wrong</h1>
          <p>Please reload the page to restart the experience.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </main>
      );
    }

    return this.props.children;
  }
}
