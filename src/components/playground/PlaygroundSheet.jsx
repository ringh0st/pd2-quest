// "Try it" on a code example: the playground in a bottom sheet.
import { useId } from 'react';
import { Sheet } from '../Sheet.jsx';
import { Icon } from '../icons/Icon.jsx';
import { Playground } from './Playground.jsx';

export function PlaygroundSheet({ open, onClose, code }) {
  const titleId = useId();
  return (
    <Sheet open={open} onClose={onClose} labelledBy={titleId}>
      <div className="spread">
        <h2 id={titleId} className="pq-head"><span className="pq-tile s"><Icon name="play" /></span><span>Try it</span></h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      </div>
      {open && <Playground initialCode={code} />}
    </Sheet>
  );
}
