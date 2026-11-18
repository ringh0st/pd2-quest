// A place on the Top players list: a gold, silver or bronze medal for 1–3 (with the number, so color is never the
// only signal), a plain number after that.
import { Icon } from '../icons/Icon.jsx';

const MEDAL = ['gold', 'silver', 'bronze'];

export function TopPlace({ n, size = 'm' }) {
  return n <= 3
    ? <span className={`top-medal ${MEDAL[n - 1]}${size === 's' ? ' s' : ''}`}><Icon name="medal" /><span className="top-medal-n">{n}</span><span className="sr-only">Place {n}</span></span>
    : <span className="top-place"><span className="sr-only">Place </span>{n}</span>;
}
