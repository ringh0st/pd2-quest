// "Build the sentence": tap the word tiles in order; tap a placed word to take it back. Keyboard: Tab + Enter.
// The answer is the placed words joined with spaces (checked like a typed answer).
import { useMemo } from 'react';
import { Icon } from '../icons/Icon.jsx';
import { shuffle } from '../../engine/session.js';

export function OrderTiles({ tiles, placed, onChange, revealed, result }) {
  // a stable shuffled order for this question
  const order = useMemo(() => shuffle(tiles.map((_, i) => i)), [tiles]);
  const used = new Set(placed);
  return (
    <div className={`order ${revealed ? (result?.right ? 'right' : 'wrong') : ''}`}>
      <div className="order-line" aria-label="Your sentence" role="group">
        {placed.length === 0 && <span className="small muted">Tap the words in order</span>}
        {placed.map((i, k) => (
          <button key={`${i}-${k}`} type="button" className="order-tile placed" lang="fi" disabled={revealed}
            onClick={() => onChange(placed.filter((_, j) => j !== k))} aria-label={`${tiles[i]} (tap to remove)`}>
            {tiles[i]}
          </button>
        ))}
      </div>
      {!revealed && (
        <div className="order-bank" role="group" aria-label="Words">
          {order.map((i) => (
            <button key={i} type="button" className="order-tile" lang="fi" disabled={used.has(i)} onClick={() => onChange([...placed, i])}>
              {tiles[i]}
            </button>
          ))}
          {placed.length > 0 && <button type="button" className="btn ghost small" onClick={() => onChange([])}><Icon name="retry" /> Start over</button>}
        </div>
      )}
      {revealed && !result?.right && <p className="typed-fix"><strong>Answer:</strong> <span className="answer-pill" lang="fi">{result?.expected}</span></p>}
    </div>
  );
}
