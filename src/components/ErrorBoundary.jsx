// Last line of defence: if a screen crashes, show a calm recovery card instead of a white screen.
import { track } from '../lib/track.js';
import { Component } from 'react';
import { exportProgress } from '../state/store.js';
import { HeroArt } from './art/HeroArt.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`${track.name} crashed`, error, info?.componentStack);
  }

  backup = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${track.id}-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="screen" id="main" role="alert" style={{ justifyContent: 'center' }}>
        <div className="card stack center">
          <div className="pq-error-art"><HeroArt kind="oops" size={96} /></div>
          <h1>Oops, that screen tripped</h1>
          <p className="muted">Your progress is safe. Go home, or save a backup first if you like.</p>
          <button className="btn primary block big" onClick={() => { window.location.hash = '#/'; this.setState({ error: null }); }}>Go home</button>
          <button className="btn block" onClick={this.backup}>Save a backup file</button>
          <button className="btn ghost block small" onClick={() => window.location.reload()}>Reload the app</button>
        </div>
      </main>
    );
  }
}
