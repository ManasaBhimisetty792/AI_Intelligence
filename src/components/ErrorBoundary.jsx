import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Unhandled UI Component Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '2rem',
            background: 'var(--color-bg, #f7faf9)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 600,
              width: '100%',
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '1px solid #eef1f5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#dc2626' }}>
              <span style={{ fontSize: '1.8rem' }}>⚠️</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Application Component Exception</h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              An exception occurred while rendering this page. Below are the execution error details:
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                color: '#991b1b',
                maxHeight: 200,
                overflowY: 'auto',
                marginBottom: '1.5rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              <strong>{this.state.error?.name}:</strong> {this.state.error?.message}
              {this.state.errorInfo?.componentStack && (
                <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  localStorage.removeItem('st_user');
                  window.location.href = '/login';
                }}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Reset Session & Login
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#1abc9c',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
