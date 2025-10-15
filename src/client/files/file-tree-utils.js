import { API } from "../utils/api.js";
import { ErrorNotice, Warning } from "../utils/notifications.js";
import { getMimeType } from "./content-types.js";
import { updatePreview } from "../preview/preview.js";
import { getOrCreateFileEditTab } from "../editor/editor-entry.js";
import { DEFAULT_FILES } from "./default-files.js";
import { unzip } from "/vendor/unzipit.module.js";
import { CustomWebsocketInterface } from "./websocket-interface.js";
import { Rewinder } from "./rewind.js";
import { handleFileHistory } from "./websocket-interface.js";
import { supportFileExtension } from "./inject-file-tree-icons.js";

const RETRY_INTERVAL = 3000;
const MAX_RETRIES = 5;
const { useWebsockets } = document.body.dataset;

const { defaultCollapse, defaultFile, projectMember, projectSlug } =
  document.body.dataset;

const fileTree = document.getElementById(`filetree`);
const col1 = document.querySelector(`.left.column`);

/**
 * When the file tree is ready, make sure to collapse anything
 * that's beeen marked as auto-collapse as part of the project
 * requirements.
 */
fileTree.addEventListener(`tree:ready`, async () => {
  let fileEntry;

  fileTree
    .findAll(`file-entry`)
    .forEach(({ extension }) => supportFileExtension(extension));

  if (defaultFile) {
    fileEntry = fileTree.querySelector(`file-entry[path="${defaultFile}"]`);
  } else {
    for (const d of DEFAULT_FILES) {
      fileEntry = fileTree.querySelector(`file-entry[path="${d}"]`);
      if (fileEntry) break;
    }
  }

  if (defaultCollapse.trim()) {
    const entries = defaultCollapse
      .split(`\n`)
      .map((v) => v.trim())
      .filter(Boolean);
    entries.forEach((path) => {
      let entry = fileTree.querySelector(`dir-entry[path="${path}/"]`);
      entry?.toggle(true);
    });
  }

  if (fileEntry) {
    getOrCreateFileEditTab(
      fileEntry,
      projectSlug,
      fileEntry.getAttribute(`path`),
    );
  }
});

/**
 * Make sure we're in sync with the server...
 */
export async function setupFileTree() {
  const dirData = await API.files.dir(projectSlug);
  if (dirData instanceof Error) return;
  // Only folks with edit rights get a websocket connection:

  if (useWebsockets && projectMember) {
    let initial;
    let retried = false;

    const url = `wss://${location.host}`;
    async function connect(retry = 0) {
      if (retry === MAX_RETRIES) {
        return setTimeout(
          () =>
            new ErrorNotice(
              `Cannot connect to the server... it might be offline?`,
            ),
          RETRY_INTERVAL,
        );
      }

      // Why does it take so bloody long for the websocket
      // connection to get established? What is blocking it?
      const OT = await fileTree.connectViaWebSocket(
        url,
        projectSlug,
        60_000,
        CustomWebsocketInterface,
      );

      // Is there a failed initial attemp that needs to
      // be shut down again?
      initial ??= OT;
      if (retried) initial.socket.close();

      // auto-reconnect when we get booted.
      OT.socket.addEventListener(`close`, () => {
        if (retried && initial === OT) return;
        setTimeout(() => {
          if (globalThis.__shutdown) return;
          new Warning(
            `No connection to server, trying to connect...`,
            RETRY_INTERVAL,
          );
          connect(retry + 1);
        }, RETRY_INTERVAL);
      });

      return true;
    }

    // Check whether we've managed to set up an initial
    // connection within X seconds and if not, try again.
    const success = await Promise.race([
      connect(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);

    if (success !== true) {
      new ErrorNotice(
        `initial connection took longer than a second`,
        RETRY_INTERVAL,
      );
      retried = true;
      connect();
    }
  } else {
    fileTree.setContent(dirData);
  }
  addFileTreeHandling();
}

/**
 * Deal with all the events that might be coming from the file tree
 */
function addFileTreeHandling() {
  addFileClick(fileTree, projectSlug);
  addFileCreate(fileTree, projectSlug);
  addFileMove(fileTree, projectSlug);
  addFileDelete(fileTree, projectSlug);

  addDirClick(fileTree, projectSlug);
  addDirToggle(fileTree, projectSlug);
  addDirCreate(fileTree, projectSlug);
  addDirMove(fileTree, projectSlug);
  addDirDelete(fileTree, projectSlug);
}

/**
 * Check if the file tree needs more space
 */
export function ensureFileTreeWidth() {
  // Get the column width, but if it's "fully" collapsed,
  // just return, because the user will not want that expanded.
  const wc = col1.clientWidth;
  if (wc < 16) return;

  // If we're still here, do we need to the grow the column width?
  const wf = fileTree.scrollWidth;
  const diff = wf - wc;
  if (diff <= 0) return;

  // If we're still here, we do. Fire off an update instruction.
  col1.parentNode.dispatchEvent(
    new CustomEvent(`update:col1`, {
      detail: { diff: diff + 16 },
    }),
  );
}

// ==================
//   file click
// ==================

async function addFileClick(fileTree, projectSlug) {
  fileTree.addEventListener(`file:click`, async (evt) => {
    const fileEntry = evt.detail.grant();
    getOrCreateFileEditTab(
      fileEntry,
      projectSlug,
      fileEntry.getAttribute(`path`),
    );

    // note: we handle "selection" in the file tree as part of editor
    // reveals, so we do not call the event's own grant() function.

    if (Rewinder.active) {
      // TODO: DRY: can we unify this with editor-components and event-handling
      if (useWebsockets) {
        fileTree.OT?.getFileHistory(fileEntry.path);
      } else {
        const history = await API.files.history(projectSlug, fileEntry.path);
        handleFileHistory(fileEntry, projectSlug, history);
      }
    }

    ensureFileTreeWidth();
  });
}

// ==================
//   file create
// ==================

async function uploadFile(fileTree, fileName, content, grant) {
  const fileSize = content.byteLength;

  if (fileSize > 10_000_000) {
    return alert(`File uploads are limited to 10 MB`);
  }

  if (fileTree.OT) {
    if (content instanceof ArrayBuffer) {
      content = Array.from(new Uint8Array(content));
    }
    return grant(content);
  }

  const form = new FormData();
  form.append(`filename`, fileName);
  form.append(
    `content`,
    typeof content === "string"
      ? content
      : new Blob([content], { type: getMimeType(fileName) }),
  );
  const response = await API.files.upload(projectSlug, fileName, form);
  if (response instanceof Error) return;
  if (response.status === 200) {
    grant?.();
  } else {
    const msg = `Could not upload ${fileName}`;
    new Warning(msg);
    console.warn(`${msg} (status:${response.status})`);
  }
}

async function uploadArchive(path, content, bulkUploadPaths) {
  const basePath = path.substring(0, path.lastIndexOf(`/`) + 1);
  let { entries } = await unzip(new Uint8Array(content).buffer);

  entries = Object.entries(entries).map(([path, entry]) => ({
    path,
    entry,
  }));

  // Is this a "single dir that houses the actual content" zip?
  const prefix = (function findPrefix() {
    let a = entries[0].path;
    if (!a.includes(`/`)) return;
    a = a.substring(0, a.indexOf(`/`) + 1);
    if (entries.every((e) => e.path.startsWith(a))) return a;
  })();

  if (prefix) {
    const singletonDir = prefix.substring(0, prefix.length - 1);
    if (confirm(`Unpack into the root, rather than "${singletonDir}"?`)) {
      entries.forEach((e) => (e.path = e.path.replace(prefix, ``)));
    }
  }

  // Record which file's we're uploading, so that we can
  // make sure NOT to open each of them and end up with
  // a thousand open tabs that we can't hope to all close.
  bulkUploadPaths.push(...entries.map((e) => e.path));

  // Time to upload each file.
  for await (let { path, entry } of entries) {
    path = basePath + path;
    const arrayBuffer = await entry.arrayBuffer();
    const isFile = !entry.isDirectory;
    let content = undefined;
    if (isFile && arrayBuffer.byteLength > 0) {
      content = new TextDecoder().decode(arrayBuffer);
    }
    fileTree.createEntry(path, isFile, content);
  }
}

async function addFileCreate(fileTree, projectSlug) {
  const bulkUploadPaths = [];

  fileTree.addEventListener(`file:create`, async (evt) => {
    const { path, content, bulk, grant } = evt.detail;

    // file upload/drop
    if (content) {
      // Bulk upload
      if (path.endsWith(`.zip`) && confirm(`Unpack zip file?`)) {
        bulkUploadPaths.splice(0, bulkUploadPaths.length);
        uploadArchive(path, content, bulkUploadPaths);
      }

      // Single file upload
      else {
        const fileEntry = await uploadFile(fileTree, path, content, grant);
        if (!bulk && !bulkUploadPaths.includes(path)) {
          supportFileExtension(fileEntry.extension);
          getOrCreateFileEditTab(fileEntry, projectSlug, path);
        }
      }

      updatePreview();
    }

    // regular file creation
    else {
      const runCreate = () => {
        const fileEntry = grant();
        supportFileExtension(fileEntry.extension);
        getOrCreateFileEditTab(fileEntry, projectSlug, path);
      };

      if (fileTree.OT) {
        runCreate();
      } else {
        const response = await API.files.create(projectSlug, path);
        if (response instanceof Error) return;
        if (response.status === 200) {
          runCreate();
        } else {
          const msg = `Could not create ${path}`;
          new Warning(msg);
          console.warn(`${msg}} (status:${response.status})`);
        }
      }
    }

    ensureFileTreeWidth();
  });

  fileTree.addEventListener(`ot:created`, (evt) => {
    // We don't actually want to do anything
    // beyond "add the file tree entry"
  });
}

// ==================
//  file rename/move
// ==================

function updateEditorBindings(fileTreeEntry) {
  const { path, state: entry } = fileTreeEntry;
  if (!entry) return;

  let key = path;
  if (key.includes(`/`)) {
    key = key.substring(key.lastIndexOf(`/`) + 1);
  }

  const { tab, panel } = entry;
  if (tab) {
    tab.title = path;
    tab.childNodes.forEach((n) => {
      if (n.nodeName === `#text`) {
        n.textContent = key;
      }
    });
  }
  if (panel) {
    panel.title = panel.id = path;
  }

  fileTreeEntry.setState(entry);
}

async function addFileMove(fileTree, projectSlug) {
  const renameHandler = async (evt) => {
    const { oldPath, newPath, grant } = evt.detail;

    const runMove = () => {
      const fileEntry = grant();
      supportFileExtension(fileEntry.extension);
      updateEditorBindings(fileEntry);
    };

    if (fileTree.OT) {
      return runMove();
    }

    const response = await API.files.rename(projectSlug, oldPath, newPath);
    if (response instanceof Error) return;
    if (response.status === 200) {
      runMove();
    } else {
      const msg = `Could not move ${oldPath} to ${newPath}`;
      new Warning(msg);
      console.warn(`${msg} (status:${response.status})`);
    }
    updatePreview();
    ensureFileTreeWidth();
  };

  // rename is really just a move, but in terms of user experience
  // it's a different action, so there are two events for it.
  fileTree.addEventListener(`file:rename`, renameHandler);
  fileTree.addEventListener(`file:move`, renameHandler);

  // When OT applies it, though, there is no user interaction:
  // both rename and move operations are just "ot:moved".
  fileTree.addEventListener(`ot:moved`, async (evt) => {
    updateEditorBindings(evt.detail.entry);
  });
}

// ==================
//    file delete
// ==================

async function addFileDelete(fileTree, projectSlug) {
  fileTree.addEventListener(`file:delete`, async (evt) => {
    const { path, grant } = evt.detail;

    const runDelete = () => {
      const [entry] = grant();
      const { editorEntry } = entry.state ?? {};
      editorEntry?.unload();
    };

    if (fileTree.OT) {
      return runDelete();
    }

    if (path) {
      try {
        const response = await API.files.delete(projectSlug, path);
        if (response instanceof Error) return;
        if (response.status === 200) {
          runDelete();
        } else {
          const msg = `Could not delete ${path}`;
          new Warning(msg);
          console.warn(`${msg} (status:${response.status})`);
        }
      } catch (e) {
        console.error(e);
      }
    }
    updatePreview();
    ensureFileTreeWidth();
  });

  fileTree.addEventListener(`ot:deleted`, async (evt) => {
    const { entries } = evt.detail;
    const [fileEntry] = entries;
    const { editorEntry } = fileEntry.state ?? {};
    editorEntry?.unload();
  });
}

// ==================
//   dir click
// ==================

async function addDirClick(fileTree, projectSlug) {
  fileTree.addEventListener(`dir:click`, async (evt) => {
    evt.detail.grant();
    ensureFileTreeWidth();
  });
}

// ==================
//   dir toggle
// ==================

async function addDirToggle(fileTree, projectSlug) {
  fileTree.addEventListener(`dir:toggle`, async (evt) => {
    evt.detail.grant();
    ensureFileTreeWidth();
  });
}
// ==================
//    dir create
// ==================

async function addDirCreate(fileTree, projectSlug) {
  fileTree.addEventListener(`dir:create`, async (evt) => {
    const { path, grant } = evt.detail;
    if (fileTree.OT) {
      grant();
    } else {
      const response = await API.files.create(projectSlug, path);
      if (response instanceof Error) return;
      if (response.status === 200) {
        grant();
      } else {
        const msg = `Could not create ${path}`;
        new Warning(msg);
        console.warn(`${msg} (status:${response.status})`);
      }
    }

    ensureFileTreeWidth();
  });
}

// ==================
//   dir rename/move
// ==================

async function addDirMove(fileTree, projectSlug) {
  const dirRenameHandler = async (evt) => {
    const { oldPath, newPath, grant } = evt.detail;
    if (fileTree.OT) {
      grant();
    } else {
      const response = await API.files.rename(projectSlug, oldPath, newPath);
      if (response instanceof Error) return;
      if (response.status === 200) {
        grant();
      } else {
        const msg = `Could not rename ${oldPath} to ${newPath}`;
        new Warning(msg);
        console.warn(`${msg} (status:${response.status})`);
      }
    }

    updatePreview();
    ensureFileTreeWidth();
  };

  fileTree.addEventListener(`dir:rename`, dirRenameHandler);
  fileTree.addEventListener(`dir:move`, dirRenameHandler);
}

// ==================
//     dir delete
// ==================

async function addDirDelete(fileTree, projectSlug) {
  fileTree.addEventListener(`dir:delete`, async (evt) => {
    const { path, grant } = evt.detail;
    if (fileTree.OT) return grant();

    const response = await API.files.delete(projectSlug, path);
    if (response instanceof Error) return;
    if (response.status === 200) {
      grant();
    } else {
      const msg = `Could not delete ${path}`;
      new Warning(msg);
      console.warn(`${msg} (status:${response.status})`);
    }
    updatePreview();
    ensureFileTreeWidth();
  });
}
