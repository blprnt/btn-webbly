import { API } from "./api.js";

export const noop = () => {};

const { min } = Math;

/**
 * nicer than always typing document.quertySelector
 */
export function find(qs) {
  return document.querySelector(qs);
}

/**
 * nicer than always typing document.quertySelectorAll
 */
export function findAll(qs) {
  return document.querySelectorAll(qs);
}

/**
 * nicer than always typing document.createElement
 */
export function create(tag, attributes = {}, evts = {}) {
  const e = document.createElement(tag);
  Object.entries(attributes).forEach(([k, v]) => {
    if (k === `textContent`) {
      e.textContent = attributes.textContent;
      return;
    }
    if (k.startsWith(`data`)) {
      k = k.replace(/([A-Z])/g, (_, l) => `-${l.toLowerCase()}`);
    }
    e.setAttribute(k, v);
  });
  Object.entries(evts).forEach(([t, fn]) => e.addEventListener(t, fn));
  return e;
}

/**
 * helper function for getting file text content:
 */
export async function fetchFileContents(
  projectSlug,
  fileName,
  type = `text/plain`,
) {
  const response = await API.files.get(projectSlug, fileName);
  if (response instanceof Error) return response;
  if (type.startsWith(`text`) || type.startsWith(`application`))
    return response.text();
  return response.arrayBuffer();
}

/**
 * A very dumb digest function that just sums the
 * bytes in a file. We don't care about collision, we just
 * care that it's good enough to signal that two files that
 * should be the same, are somehow not the same.
 */
export function getFileSum(data) {
  const enc = new TextEncoder();
  return enc.encode(data).reduce((t, e) => t + e, 0);
}

/**
 * simple array-like comparison
 * @returns
 */
export function listEquals(a1, a2) {
  if (a1.length !== a2.length) return false;
  return a1.every((v, i) => a2[i] === v);
}

/**
 * Update the editor text while maintaining the
 * scroll position. In a janky fashion, but
 * janky is better than "not at all".
 *
 * TODO: ideally we can preserve scroll position cleanly? https://github.com/Pomax/make-webbly-things/issues/105
 *
 * @param {*} editorEntry
 * @param {*} content
 */
export async function updateViewMaintainScroll(
  editorEntry,
  content = editorEntry.content,
  editable = editorEntry.editable,
) {
  const { view } = editorEntry;
  editorEntry.setEditable(editable);
  const { doc, selection } = view.state;
  const cursor = doc.lineAt(selection.main.head);
  const line = doc.line(cursor.number);
  view.dispatch({
    changes: {
      from: 0,
      to: doc.length ?? 0,
      insert: content,
    },
    selection: {
      anchor: min(content.length, line.from ?? 0),
      head: min(content.length, line.from ?? 0),
    },
    scrollIntoView: true,
  });
}
