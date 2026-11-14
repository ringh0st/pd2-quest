// A tiny tokenizer for Apex / JS / SOQL / HTML snippets. Returns [{t: kind, v: text}].
const KEYWORDS = new Set(`public private protected global static final abstract virtual override with without inherited sharing class interface extends implements
return if else for while do try catch finally throw new this super void null true false instanceof switch on when break continue
trigger before after insert update delete undelete upsert merge select from where and or not in limit order by group having offset
import export default const let var function async await of typeof get set transient testmethod webservice enum
SELECT FROM WHERE AND OR NOT IN LIMIT ORDER BY GROUP HAVING OFFSET WITH USER_MODE SYSTEM_MODE SECURITY_ENFORCED FOR UPDATE ASC DESC NULLS FIRST LAST LIKE TYPEOF END WHEN THEN ELSE`.split(/\s+/));
const TYPES = /^(String|Integer|Long|Decimal|Double|Boolean|Id|Date|Datetime|Time|Blob|Object|List|Set|Map|SObject|Account|Contact|Opportunity|Case|Lead|User|Database|System|Test|Schema|Limits|Http|HttpRequest|HttpResponse|EventBus|Queueable|Schedulable|Batchable|QueueableContext|SchedulableContext|BatchableContext|Exception|DmlException|Assert|LightningElement|AuraHandledException|Savepoint|Security|AccessType)$/;

const RULES = [
  ['comment', /^\/\/[^\n]*/],
  ['comment', /^\/\*[\s\S]*?\*\//],
  ['comment', /^<!--[\s\S]*?-->/],
  ['string', /^'(?:\\.|[^'\\])*'/],
  ['string', /^"(?:\\.|[^"\\])*"/],
  ['string', /^`(?:\\.|[^`\\])*`/],
  ['annotation', /^@[A-Za-z]+/],
  ['tag', /^<\/?[a-zA-Z][\w:-]*/],
  ['number', /^\d+(\.\d+)?/],
  ['word', /^[A-Za-z_$][\w$]*/],
  ['punct', /^[{}()[\];,.<>=!+\-*/&|?:%]+/],
  ['space', /^\s+/],
  ['other', /^./],
];

export function tokenize(code) {
  const out = [];
  let rest = code;
  while (rest.length) {
    for (const [kind, re] of RULES) {
      const m = rest.match(re);
      if (!m) continue;
      let t = kind;
      if (kind === 'word') t = KEYWORDS.has(m[0]) ? 'keyword' : TYPES.test(m[0]) ? 'type' : /^\(/.test(rest.slice(m[0].length)) ? 'fn' : 'plain';
      out.push({ t, v: m[0] });
      rest = rest.slice(m[0].length);
      break;
    }
  }
  return out;
}
