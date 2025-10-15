import { API } from "../utils/api.js";
import { ErrorNotice } from "../utils/notifications.js";

const restart = document.querySelector(`#preview-buttons .restart`);
const pause = document.querySelector(`#preview-buttons .pause`);
const newtab = document.querySelector(`#preview-buttons .newtab`);
const preview = document.getElementById(`preview`);
const { projectSlug } = document.body.dataset;

let failures = 0;
let first_time_load = 0;

let refresh = true;

if (pause) {
  pause.addEventListener(`click`, () => {
    refresh = !refresh;
    pause.textContent = refresh ? `pause` : `refresh`;
    if (refresh) updatePreview();
  });
}

/**
 * update the <graphics-element> based on the current file content.
 */
export async function updatePreview() {
  if (!refresh) return;

  const iframe = preview.querySelector(`iframe`);
  const newFrame = document.createElement(`iframe`);

  if (first_time_load++ < 10) {
    // console.log(`checking container for ready`);
    const status = await API.projects.health(projectSlug);
    if (status === `failed`) {
      // There's only so many times we'll try a failure reload.
      if (failures < 3) {
        failures++;
        return setTimeout(updatePreview, 1000);
      }
      return new ErrorNotice(`Project failed to start...`);
    } else if (status === `not running` || status === `wait`) {
      if (first_time_load < 10) {
        return setTimeout(updatePreview, 1000);
      } else {
        return console.log(`this project failed to start in a timely manner.`);
      }
    }
  }

  newFrame.onerror = () => {
    console.log(`what?`, e);
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

  // console.log(`using ${src}`);
  preview.append(newFrame);
  setTimeout(() => (newFrame.src = src), 100);
}

restart?.addEventListener(`click`, async () => {
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
