import React from "react";
import ServerErrorPage from "./ServerErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) return <ServerErrorPage />;
    return this.props.children;
  }
}

export default ErrorBoundary;
