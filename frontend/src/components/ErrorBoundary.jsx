import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-900">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4 text-6xl">!</div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              The page failed to load. Please try refreshing.
            </p>
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
