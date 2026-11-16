// Runs an e2e script against one exam: TRACK=pd1 node e2e/behavior.cjs (default pd2).
// The scripts seed progress under the PD2 storage key; for another exam this maps those keys to that
// exam's keys (lib/track.js does the same in the app) and picks the exam before the app loads.
const TRACK = process.env.TRACK || 'pd2';

function launchForTrack(chromium, options) {
  return chromium.launch(options).then((browser) => {
    const newContext = browser.newContext.bind(browser);
    browser.newContext = async (contextOptions) => {
      const ctx = await newContext(contextOptions);
      await ctx.addInitScript((track) => {
        localStorage.setItem('devquest.track', track);
        if (track === 'pd2') return;
        const toTrack = (key) => String(key).replace(/^pd2quest/, `${track}quest`);
        const { getItem, setItem, removeItem } = Storage.prototype;
        Storage.prototype.getItem = function get(key) { return getItem.call(this, toTrack(key)); };
        Storage.prototype.setItem = function set(key, value) { return setItem.call(this, toTrack(key), value); };
        Storage.prototype.removeItem = function remove(key) { return removeItem.call(this, toTrack(key)); };
      }, TRACK);
      return ctx;
    };
    return browser;
  });
}

module.exports = { TRACK, launchForTrack };
