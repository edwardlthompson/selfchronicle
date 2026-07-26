export type WelcomeStep = "privacy" | "outlets" | "review" | "done";
export type WelcomeOutlet =
  | ""
  | "github"
  | "linkslander"
  | "drive"
  | "chatgpt"
  | "paste";

export type WelcomeModel = {
  step: WelcomeStep;
  outlet: WelcomeOutlet;
  username: string;
  siteUrl: string;
  pasteRaw: string;
  busy: boolean;
  error: string;
  previewCount: number;
  sampleTitles: string[];
  hasLinksLander: boolean;
  enrichLinkedOnCommit: boolean;
  committed: string;
  selectedFormat: string;
};
