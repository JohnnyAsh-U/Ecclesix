import React from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ error, info })
    // TODO: send to error tracking (Sentry, LogRocket, etc.)
    if (window && window.console) {
      console.error('Uncaught error:', error, info)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null })
    // attempt a hard reload
    window.location.reload()
  }

  renderFallback() {
    const { error } = this.state
    return (
      <div style={styles.container} role="alert">
        <div style={styles.card}>
          <div style={styles.emoji}>😵‍💫</div>
          <h1 style={styles.title}>Quelque chose s'est mal passé</h1>
          <p style={styles.text}>L'application a rencontré une erreur inattendue. Vous pouvez réessayer ou revenir à l'accueil.</p>

          {error && (
            <details style={styles.details}>
              <summary>Détails (utile pour le support)</summary>
              <pre style={styles.pre}>{String(error && error.toString())}</pre>
            </details>
          )}

          <div style={styles.actions}>
            <button onClick={this.handleReload} style={styles.primary}>Actualiser</button>
            <Link to="/" style={styles.link}>Accueil</Link>
            <a href="mailto:support@ecclesix.com" style={styles.muted}>Contacter le support</a>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback()
    }
    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #f7f8fb, #ffffff)',
    padding: 24,
  },
  card: {
    maxWidth: 720,
    width: '100%',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(20,30,70,0.08)',
    padding: '32px 28px',
    textAlign: 'center',
    border: '1px solid #f0f2f8'
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 22,
    color: '#102a43',
  },
  text: {
    color: '#334e68',
    marginTop: 8,
    marginBottom: 16,
  },
  details: {
    textAlign: 'left',
    margin: '12px 0',
    background: '#f8f9fb',
    padding: 10,
    borderRadius: 6,
    maxHeight: 160,
    overflow: 'auto'
  },
  pre: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
    fontSize: 12,
    color: '#102a43'
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap'
  },
  primary: {
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  link: {
    color: '#0d6efd',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid transparent'
  },
  muted: {
    color: '#657786',
    fontSize: 14,
    textDecoration: 'none'
  }
}

export default ErrorBoundary
