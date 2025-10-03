import { fetchFileContents, updateViewMaintainScroll } from "../utils/utils.js";
import { API } from "../utils/api.js";
import { Notice } from "../utils/notifications.js";
import { Rewinder } from "../files/rewind.js";
import { handleFileHistory } from "../files/websocket-interface.js";

const mac = navigator.userAgent.includes(`Mac OS`);
const { useWebsockets } = document.body.dataset;

// These always exist
const left = document.getElementById(`left`);
const right = document.getElementById(`right`);

/**
 * Hook up the "Add new file" and "Format this file" buttons
 */
export function addEventHandling(projectSlug) {
  disableSaveHotkey();
  enableDownloadButton(projectSlug);
  connectPrettierButton(projectSlug);
  enableRewindFunctions(projectSlug);
  addTabScrollHandling();

  // Lastly: make sure we can tell whether or not this
  // document is "dead" and about to get cleaned up.
  globalThis.addEventListener("beforeunload", () => {
    globalThis.__shutdown = true;
  });
}

/**
 * ...docs go here...
 */
function disableSaveHotkey() {
  // disable the "Save page" shortcut because it's meaningless in this context.
  document.addEventListener(`keydown`, (evt) => {
    const { key, ctrlKey, metaKey } = evt;
    if (key === `s`) {
      if ((mac && metaKey) || ctrlKey) {
        evt.preventDefault();
        new Notice(`Your files are auto-saved =)`, 2000);
      }
    }
  });
}

/**
 * ...docs go here...
 */
function enableDownloadButton(projectSlug) {
  const download = document.getElementById(`download`);
  if (!download) return;

  download.addEventListener(`click`, async () => {
    API.projects.download(projectSlug);
  });
}

/**
 * ...docs go here...
 */
function connectPrettierButton(projectSlug) {
  const format = document.getElementById(`format`);
  if (!format) return;

  format.addEventListener(`click`, async () => {
    const tab = document.querySelector(`.active`);
    const fileEntry = document.querySelector(`file-entry.selected`);
    if (fileEntry.state?.tab !== tab) {
      throw new Error(`active tab has no associated selected file? O_o`);
    }
    const fileName = fileEntry.path;
    format.hidden = true;
    const result = await API.files.format(projectSlug, fileName);
    if (result instanceof Error) return;
    format.hidden = false;
    const content = await fetchFileContents(projectSlug, fileName);
    fileEntry.setState({ content });
    updateViewMaintainScroll(fileEntry, content);
  });
}

/**
 * ...docs go here...
 */
function enableRewindFunctions(projectSlug) {
  const rewindBtn = document.getElementById(`rewind`);
  if (!rewindBtn) return;

  rewindBtn.addEventListener(`click`, async () => {
    rewindBtn.blur();
    const path = document.querySelector(`.active.tab`).title;
    const fileTree = document.querySelector(`file-tree`);
    if (path) {
      const fileEntry = document.querySelector(`file-entry[path="${path}"]`);
      if (fileEntry) {
        const { rewind } = fileEntry.state ?? {};
        if (rewind && rewind.open) {
          fileTree.classList.remove(`rewinding`);
          Rewinder.close();
        } else {
          Rewinder.enable();
          fileTree.classList.add(`rewinding`);
          // TODO: DRY: can we unify this with file-tree-utils and editor-components
          if (useWebsockets) {
            fileTree.OT?.getFileHistory(path);
          } else {
            const history = await API.files.history(projectSlug, path);
            handleFileHistory(fileEntry, projectSlug, history);
          }
        }
      }
    }
  });
}

/**
 * Basic tab scrolling: click/touch-and-hold
 */
function addTabScrollHandling() {
  let scrolling = false;

  function scrollTabs(step) {
    if (!scrolling) return;
    tabs.scrollBy(step, 0);
    setTimeout(() => scrollTabs(step), 4);
  }

  for (const type of [`mouseup`, `touchend`]) {
    document.addEventListener(type, () => (scrolling = false));
  }

  for (const type of [`mouseout`, `touchend`]) {
    left.addEventListener(type, () => (scrolling = false));
    right.addEventListener(type, () => (scrolling = false));
  }

  for (const type of [`mousedown`, `touchstart`]) {
    left.addEventListener(type, () => {
      scrolling = true;
      scrollTabs(-2);
    });
    right.addEventListener(type, () => {
      scrolling = true;
      scrollTabs(2);
    });
  }
}
