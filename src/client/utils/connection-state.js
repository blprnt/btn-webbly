// Tracks whether the websocket connection to the file-sync server is
// currently up, so other modules (save status, preview label, sync)
// can react to connection loss instead of silently pretending
// everything got saved.
let connected = false;
const listeners = new Set();

export function setConnected(value) {
  if (connected === value) return;
  connected = value;
  listeners.forEach((fn) => fn(connected));
}

export function isConnected() {
  return connected;
}

export function onConnectionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
