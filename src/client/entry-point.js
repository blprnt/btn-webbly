import { setupFileTree } from "./files/file-tree-utils.js";
import { setupUIEventHandling } from "./editor/event-handling.js";
import { updatePreview } from "./preview/preview.js";

// CodeMirror 6 has no built in file browser, so we need to add one.
await setupFileTree();

// As such, we also need custom handling for things like
// the settings button, download, rewind, etc.
setupUIEventHandling();

// And in order to get the preview going, we trigger an update.
updatePreview();
