import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Suppress specific React concurrent rendering errors
    if (error.message.includes("concurrent rendering")) {
      return;
    }

    console.error("Unexpected error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return null; // or custom fallback UI
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
