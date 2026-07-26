import {
  renderFocusChip,
  renderFocusSettings,
  renderQuietBanner,
} from "./FocusView";
import { loadFocusQuiet, saveFocusQuiet, type FocusQuietSettings } from "./settings";

export function createFocusSession(): {
  banners: () => string;
  settingsHtml: () => string;
  settings: () => FocusQuietSettings;
  reload: () => void;
  bind: (root: HTMLElement, onChange: () => void) => void;
} {
  let settings = loadFocusQuiet();
  return {
    banners: () => renderFocusChip(settings) + renderQuietBanner(settings),
    settingsHtml: () => renderFocusSettings(settings),
    settings: () => settings,
    reload: () => {
      settings = loadFocusQuiet();
    },
    bind(root, onChange) {
      root.querySelector("[data-focus-mode]")?.addEventListener("change", (e) => {
        settings = {
          ...settings,
          focusMode: (e.target as HTMLInputElement).checked,
        };
        saveFocusQuiet(settings);
        onChange();
      });
      root.querySelector("[data-quiet-start]")?.addEventListener("change", (e) => {
        settings = {
          ...settings,
          quietStart: (e.target as HTMLInputElement).value || settings.quietStart,
        };
        saveFocusQuiet(settings);
        onChange();
      });
      root.querySelector("[data-quiet-end]")?.addEventListener("change", (e) => {
        settings = {
          ...settings,
          quietEnd: (e.target as HTMLInputElement).value || settings.quietEnd,
        };
        saveFocusQuiet(settings);
        onChange();
      });
    },
  };
}
