import { API } from "../utils/api.js";
import { ErrorNotice } from "../utils/notifications.js";

const restart = document.querySelector(`#preview-buttons .restart`);
const pause = document.querySelector(`#preview-buttons .pause`);
const newtab = document.querySelector(`#preview-buttons .newtab`);
const preview = document.getElementById(`preview`);
const { projectSlug } = document.body.dataset;

let failures = 0;
let containerReady = false;
let updateInProgress = false;

let refresh = true;

if (pause) {
  pause.addEventListener(`click`, () => {
    refresh = !refresh;
    pause.textContent = refresh ? `pause` : `refresh`;
    if (refresh) updatePreview();
  });
}

/**
 * Poll until the container is ready, then resolve.
 * Sets containerReady = true on success.
 */
async function waitForContainer() {
  while (true) {
    const status = await API.projects.health(projectSlug);
    if (status === `failed`) {
      preview.classList.remove(`loading`);
      if (failures < 3) {
        failures++;
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      new ErrorNotice(`Project failed to start...`, Infinity, () => {
        // Closing the notice resets state so the next save/action retries.
        failures = 0;
        containerReady = false;
      });
      return false;
    }
    if (status === `not running` || status === `wait`) {
      preview.classList.add(`loading`);
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    // Container is running
    containerReady = true;
    preview.classList.remove(`loading`);
    return true;
  }
}

/**
 * update the preview iframe based on the current file content.
 */
export async function updatePreview() {
  if (!refresh) return;
  if (updateInProgress) return;
  updateInProgress = true;

  try {
    if (!containerReady) {
      const ready = await waitForContainer();
      if (!ready) return;
    }

    const iframe = preview.querySelector(`iframe`);
    const newFrame = document.createElement(`iframe`);

    newFrame.onerror = (e) => {
      console.log(`iframe error`, e);
    };

    newFrame.onload = () => {
      setTimeout(() => (newFrame.style.opacity = 1), 250);
      setTimeout(() => iframe.remove(), 500);
    };

    newFrame.style.opacity = 0;
    let src = iframe.dataset.src;
    src = src.replace(/\?v=\d+/, ``);
    src += `?v=${Date.now()}`;
    newFrame.dataset.src = src;
    newFrame.dataset.projectName = iframe.dataset.projectName;
    newFrame.dataset.projectSlug = iframe.dataset.projectSlug;

    preview.append(newFrame);
    setTimeout(() => (newFrame.src = src), 100);
  } finally {
    updateInProgress = false;
  }
}

restart?.addEventListener(`click`, async () => {
  containerReady = false;
  failures = 0;
  preview.classList.add(`restarting`);
  await API.projects.restart(projectSlug);
  setTimeout(() => {
    preview.classList.remove(`restarting`);
    updatePreview();
  }, 1000);
});

newtab?.addEventListener(`click`, async () => {
  const iframe = preview.querySelector(`iframe`);
  const link = document.createElement(`a`);
  link.href = iframe.src.replace(/\?v=\d+/, ``);
  link.target = `_blank`;
  link.click();
});
