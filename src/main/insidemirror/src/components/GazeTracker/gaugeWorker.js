/* eslint-disable no-restricted-globals */

let timer = null;
let startTime = null;

self.onmessage = (e) => {
  const msg = e.data;

  if (msg === "start") {
    clearInterval(timer);
    startTime = Date.now();

    timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / 1000) * 100, 100);
      self.postMessage({ progress: percent });

      if (percent >= 100) {
        clearInterval(timer);
        self.postMessage({ complete: true });
      }
    }, 50);
  }

  if (msg === "reset") {
    clearInterval(timer);
    self.postMessage({ progress: 0 });
  }
};
