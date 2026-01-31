import { Component, type ComponentChildren } from 'preact';
import { AlertCircle } from 'lucide-preact';

interface Props {
  children: ComponentChildren;
  fallback?: ComponentChildren;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center gap-2 p-2 my-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs italic">
          <AlertCircle size={14} />
          <span>Error rendering component</span>
        </div>
      );
    }

    return this.props.children;
  }
}
