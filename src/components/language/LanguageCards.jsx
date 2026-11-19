// Lesson card parts for a language track: example sentences (Finnish with its English meaning and a listen
// button each) and small tables of forms (cases, conjugations). Inflection endings are often shown as stem|ending.
import { ListenButton } from './ListenButton.jsx';
import { Rich } from '../../lib/rich.jsx';

/** "talo|ssa" → the stem plain, the ending highlighted (the separator itself is not shown). */
export function Inflected({ text }) {
  if (typeof text !== 'string' || !text.includes('|')) return <Rich text={String(text ?? '')} />;
  return text.split(/(\S+\|\S+)/).map((part, k) => {
    const m = /^(\S+)\|(\S+)$/.exec(part);
    return m ? <span key={k} className="infl"><span>{m[1]}</span><b className="infl-end">{m[2]}</b></span> : <Rich key={k} text={part} />;
  });
}

const plain = (s) => String(s).replace(/\|/g, '').replace(/[*`]/g, '');

export function ExampleList({ items = [] }) {
  return (
    <ul className="list-plain lang-examples">
      {items.map((it, k) => (
        <li key={k} className="lang-example">
          <span className="grow">
            <span className="lang-fi" lang="fi"><Inflected text={it.fi} /></span>
            <span className="lang-en">{it.en}</span>
          </span>
          <ListenButton text={plain(it.fi)} />
        </li>
      ))}
    </ul>
  );
}

export function FormTable({ head = [], rows = [] }) {
  return (
    <div className="form-table-wrap">
      <table className="form-table" lang="fi">
        {head.length > 0 && <thead><tr>{head.map((h, k) => <th key={k} scope="col">{h}</th>)}</tr></thead>}
        <tbody>
          {rows.map((r, k) => (
            <tr key={k}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row"><Inflected text={c} /></th> : <td key={j}><Inflected text={c} /></td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
