// What the code printed, one row per line. Each kind has its own symbol as well as its color.
import { Icon } from '../icons/Icon.jsx';

const KIND = {
  log: { icon: 'chevron', name: '' },
  info: { icon: 'info', name: 'Info: ' },
  warn: { icon: 'warn', name: 'Warning: ' },
  error: { icon: 'wrong', name: 'Error: ' },
  pass: { icon: 'ok', name: 'Passed: ' },
  fail: { icon: 'wrong', name: 'Failed: ' },
};

const STATUS = {
  ready: 'Press Run to see what your code prints.',
  running: 'Running…',
  done: 'Done.',
  stopped: 'Stopped.',
  timeout: 'Stopped.',
};

export function ConsoleOutput({ status, lines, onLine }) {
  return (
    <section className="pg-console" aria-label="Console output">
      <div className="pg-console-head">
        <span className="pg-console-title">Console</span>
        <span className="pg-console-status" role="status">
          {status === 'done' && !lines.length ? 'Done. Nothing was printed: add console.log(…) to see values.' : STATUS[status]}
        </span>
      </div>
      {lines.length > 0 && (
        <ol className="pg-lines">
          {lines.map((l, i) => {
            const kind = KIND[l.level] || KIND.log;
            return (
              <li key={i} className={`pg-line pg-${l.level}`}>
                <Icon name={kind.icon} className="pg-line-icon" />
                <span className="pg-line-body">
                  <span className="sr-only">{kind.name}</span>
                  <span className="pg-line-text">{l.text}</span>
                  {l.line && <button type="button" className="pg-line-at" onClick={() => onLine?.(l.line)}>line {l.line}</button>}
                  {l.hint && <span className="pg-line-hint">{l.hint}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
