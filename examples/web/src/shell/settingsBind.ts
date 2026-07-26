import type { DayCloseController } from "../day-close/controller";
import { bindMcpPanel, mcpPanelHtml } from "../mcp-ui/bind";
import type { ProfileVault } from "../vault";
import { bindDrivePanel, driveSettingsMountHtml } from "./driveBind";

type FocusLike = {
  settingsHtml: () => string;
  bind: (root: HTMLElement, onChange: () => void) => void;
};

/** Mount Day Close + Focus + MCP + Drive panels on Settings route. */
export function bindSettingsPanels(
  root: HTMLElement,
  dayClose: DayCloseController,
  focus: FocusLike,
  onChange: () => void,
  vault: ProfileVault,
): void {
  const mount = root.querySelector("[data-dc-settings-mount]");
  if (mount) {
    mount.innerHTML =
      dayClose.settingsHtml() + focus.settingsHtml() + mcpPanelHtml() + driveSettingsMountHtml();
  }
  dayClose.bind(root, onChange, vault);
  focus.bind(root, onChange);
  bindMcpPanel(root, onChange);
  bindDrivePanel(root, vault, onChange);
}
