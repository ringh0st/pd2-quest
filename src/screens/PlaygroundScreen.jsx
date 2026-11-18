// A free playground: write any JavaScript and run it. The code is kept on this device.
import { go } from '../hooks/useRoute.js';
import { Icon } from '../components/icons/Icon.jsx';
import { Playground } from '../components/playground/Playground.jsx';

const STARTER = `// Your JavaScript playground. Change anything and press Run.
const name = 'Trailblazer';
const skills = ['let and const', 'arrow functions', 'promises'];

console.log(\`Hi \${name}! Things to try:\`);
skills.forEach((skill, i) => console.log(i + 1, skill));

const later = new Promise((resolve) => setTimeout(() => resolve('done'), 500));
later.then((value) => console.log('The promise says:', value));
`;

export function PlaygroundScreen() {
  return (
    <main className="screen" id="main">
      <div className="topbar">
        <button className="icon-btn" onClick={() => (window.history.length > 1 ? window.history.back() : go('/'))} aria-label="Back"><Icon name="back" /></button>
        <h1 className="grow pq-head"><span className="pq-tile s"><Icon name="code" /></span><span>Playground</span></h1>
      </div>
      <Playground initialCode={STARTER} saveAs="scratch" />
    </main>
  );
}
