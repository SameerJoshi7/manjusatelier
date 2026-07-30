import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4 text-center dark:bg-[#1c1712]">
          <div className="card-surface max-w-md p-8 shadow-lift">
            <h1 className="mb-4 font-serif text-3xl text-brown-dark dark:text-beige">
              Oops! Something went wrong.
            </h1>
            <p className="mb-8 text-sm text-brown/70 dark:text-beige/70">
              We encountered an unexpected error. Please try refreshing the page. If the problem persists, our team has been notified.
            </p>
            <Button onClick={() => window.location.reload()} size="lg" fullWidth>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
