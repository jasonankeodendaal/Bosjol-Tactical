import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-zinc-900 border border-red-800/50 rounded-xl text-center max-w-lg mx-auto my-8 space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mx-auto text-red-400 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-white">
            {this.props.fallbackTitle || 'An error occurred while loading this view'}
          </h2>
          <p className="text-sm text-gray-400">
            {this.state.error?.message || 'Something went wrong. Please try going back.'}
          </p>
          <div className="pt-2">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                if (this.props.onReset) {
                  this.props.onReset();
                }
              }}
              className="w-full"
            >
              Return / Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
