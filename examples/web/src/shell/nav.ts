export type ShellRoute =
  | "welcome"
  | "today"
  | "profile"
  | "learn"
  | "vault"
  | "handoff"
  | "settings";

/** Primary nav — Settings stays on the gear control, not duplicated here. */
export const SHELL_ROUTES: { id: ShellRoute; labelKey: string }[] = [
  { id: "today", labelKey: "nav.today" },
  { id: "profile", labelKey: "nav.profile" },
  { id: "learn", labelKey: "nav.learn" },
  { id: "vault", labelKey: "nav.vault" },
  { id: "handoff", labelKey: "nav.handoff" },
];
