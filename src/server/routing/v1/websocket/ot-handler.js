import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { comms } from "./comms.js";
import {
  CONTENT_DIR,
  createRewindPoint,
  readContentDir,
} from "../../../../helpers.js";
import { getProject, hasAccessToProject } from "../../../database/index.js";
import { applyPatch } from "../../../../../public/vendor/diff.js";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { getFileHistory } from "../../../git/git-utils.js";
import { FILE_TREE_PREFIX } from "custom-file-tree";

export { FILE_TREE_PREFIX };

/**
 * An "operational transform" handler for file system operations.
 */
export class OTHandler {
  constructor(socket, user) {
    Object.assign(this, {
      contentDir: CONTENT_DIR,
      id: randomUUID(),
      socket,
      user,
      writeAccess: false,
    });
    if (!this.user) this.unload();
  }

  unload() {
    comms.removeHandler(this);
    this.unreliable = true;
    this.socket.close();
    delete this.contentDir;
    delete this.basePath;
  }

  send(type, detail) {
    type = FILE_TREE_PREFIX + type;
    try {
      this.socket.send(JSON.stringify({ type, detail }));
    } catch (e) {
      // Well that's a problem...? Make sure we don't
      // try to use this handler anymore because the
      // odds of data integrity are basically zero now.
      this.unload();
    }
  }

  getFullPath(path) {
    if ([`..`, `:`].some((e) => path.includes(e))) return false;
    return join(this.contentDir, this.basePath, path);
  }

  // ==========================================================================

  async onkeepalive({ basePath }) {
    if (!basePath) {
      return console.error(`received touch call without a project slug`);
    }
    if (basePath !== this.basePath) {
      return console.error(
        `received touch call for wrong project (received ${basePath} instead of ${this.basePath})`,
      );
    }
    comms.touch(basePath);
  }

  async onload({ basePath, reconnect }) {
    console.log(new Date().toISOString(), ` - handling load call`);
    const { user, id } = this;
    // save the path and associated project
    this.basePath = basePath;
    this.project = getProject(basePath);
    // does this user have write-access to this project?
    this.writeAccess = hasAccessToProject(user, basePath);
    comms.addHandler(this);
    const { dirs, files } = readContentDir(join(CONTENT_DIR, basePath));
    const seqnum = comms.getSeqNum(basePath) - 1;
    console.log(new Date().toISOString(), ` - sending load result`);
    this.send(`load`, { id, dirs, files, seqnum, reconnect });
  }

  async onsync({ seqnum }) {
    if (seqnum > comms.getSeqNum(this.basePath)) {
      // this shouldn't be possible. Whatever this client
      // is doing, it needs to stop and reconnect.
      this.send(`terminate`, { reconnect: true });
      this.unload();
    }

    // build the list of "messages missed":
    const actions = comms.getActions(this.basePath, seqnum);

    // Then send those at 15ms intervals so the (hopefully!)
    // arrive in sequence with plenty of time to process them.
    for (const { type, detail } of actions) {
      this.send(type, detail);
      await new Promise((resolve) => resolve, 15);
    }
  }

  // ==========================================================================

  async oncreate({ path, isFile, content = `` }) {
    if (!this.writeAccess) return;
    // console.log(`on create in ${this.basePath}:`, { path, isFile, content });
    const fullPath = this.getFullPath(path);
    if (!fullPath) return;
    if (isFile) {
      if (content?.map) content = Buffer.from(content);
      mkdirSync(dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, content);
    } else {
      mkdirSync(fullPath, { recursive: true });
    }
    comms.addAction(this, { action: `create`, path, isFile, content });
  }

  async ondelete({ path }) {
    if (!this.writeAccess) return;
    // console.log(`on delete in ${this.basePath}:`, { path });
    const fullPath = this.getFullPath(path);
    if (!fullPath) return;
    rmSync(fullPath, { recursive: true, force: true });
    comms.addAction(this, { action: `delete`, path });
  }

  async onmove({ isFile, oldPath, newPath }) {
    if (!this.writeAccess) return;
    // console.log(`on move in ${this.basePath}:`, { oldPath, newPath });
    const fullOldPath = this.getFullPath(oldPath);
    if (!fullOldPath) return;
    const fullNewPath = this.getFullPath(newPath);
    if (!fullNewPath) return;
    renameSync(fullOldPath, fullNewPath);
    comms.addAction(this, { action: `move`, isFile, oldPath, newPath });
  }

  async onupdate({ path, type, update }) {
    if (!this.writeAccess) return;
    // console.log(`on update in ${this.basePath}:`, { path, update });
    const fullPath = this.getFullPath(path);
    if (!fullPath) return;
    if (this.updateHandler(fullPath, type, update)) {
      comms.addAction(this, { action: `update`, type, path, update });
    }
  }

  // ==========================================================================

  // This is not a transform, and so does not require
  // recording or broadcasting to other subscribers.
  async onread({ path }) {
    // console.log(`on read`, { path });
    const fullPath = this.getFullPath(path);
    if (!fullPath) return;
    const data = Array.from(readFileSync(fullPath));
    this.send(`read`, { path, data });
  }

  // This is also not a transform.
  async onfilehistory({ path }) {
    const history = getFileHistory(this.basePath, path);
    this.send(`filehistory`, { path, history });
  }

  // ==========================================================================

  updateHandler(fullPath, type, update) {
    if (type === `diff`) {
      // console.log(`applying diff`, update);
      const oldContent = readFileSync(fullPath).toString();
      const newContent = applyPatch(oldContent, update);
      let exception;
      if (newContent) {
        try {
          writeFileSync(fullPath, newContent.toString());
          createRewindPoint(this.project);
          return true;
        } catch (e) {
          exception = e;
        }
      }
      console.log(`could not apply diff?`, {
        oldContent,
        update,
        exception,
      });
    } else {
      console.warn(`Unknown update type "${type}" in file:update handler.`);
    }
  }
}
