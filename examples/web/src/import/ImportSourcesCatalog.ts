/** Catalog of import platforms (adapters + paste paths). FOSS text/emoji icons only. */

export type WelcomeOutletHint = "github" | "chatgpt" | "paste";

export type ImportSourceEntry = {
  sourceKey: string;
  formatKey: string;
  /** Distinct mark (emoji / initials) — not vendor trademarks. */
  icon: string;
  nameKey: string;
  howtoKey: string;
  /** Official export tutorial; null → paste-only path. */
  tutorialUrl: string | null;
  welcomeOutlet?: WelcomeOutletHint;
};

export const IMPORT_SOURCES: readonly ImportSourceEntry[] = [
  {
    sourceKey: "chatgpt_export",
    formatKey: "chatgpt_json",
    icon: "◎",
    nameKey: "import.source.chatgpt.name",
    howtoKey: "import.source.chatgpt.howto",
    tutorialUrl:
      "https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data",
    welcomeOutlet: "chatgpt",
  },
  {
    sourceKey: "claude_export",
    formatKey: "claude_export",
    icon: "◇",
    nameKey: "import.source.claude.name",
    howtoKey: "import.source.claude.howto",
    tutorialUrl: "https://privacy.claude.com/en/articles/9450526-export-your-claude-data",
  },
  {
    sourceKey: "grok_export",
    formatKey: "grok_json",
    icon: "✦",
    nameKey: "import.source.grok.name",
    howtoKey: "import.source.grok.howto",
    tutorialUrl: "https://accounts.x.ai/data",
  },
  {
    sourceKey: "memory_disclosure",
    formatKey: "memory_disclosure_md",
    icon: "◆",
    nameKey: "import.source.memory_disclosure.name",
    howtoKey: "import.source.memory_disclosure.howto",
    tutorialUrl: null,
  },
  {
    sourceKey: "gemini_export",
    formatKey: "gemini_takeout",
    icon: "✧",
    nameKey: "import.source.gemini.name",
    howtoKey: "import.source.gemini.howto",
    tutorialUrl: "https://takeout.google.com/",
  },
  {
    sourceKey: "gmail_takeout",
    formatKey: "gmail_takeout",
    icon: "✉",
    nameKey: "import.source.gmail.name",
    howtoKey: "import.source.gmail.howto",
    tutorialUrl: "https://support.google.com/mail/answer/10016932?hl=en",
  },
  {
    sourceKey: "whatsapp_export",
    formatKey: "whatsapp_txt",
    icon: "☎",
    nameKey: "import.source.whatsapp.name",
    howtoKey: "import.source.whatsapp.howto",
    tutorialUrl: "https://faq.whatsapp.com/1180414079177245",
  },
  {
    sourceKey: "meta_dyi",
    formatKey: "meta_dyi",
    icon: "◉",
    nameKey: "import.source.meta.name",
    howtoKey: "import.source.meta.howto",
    tutorialUrl: "https://www.facebook.com/help/212802592074644",
  },
  {
    sourceKey: "discord_export",
    formatKey: "discord_json",
    icon: "◈",
    nameKey: "import.source.discord.name",
    howtoKey: "import.source.discord.howto",
    tutorialUrl:
      "https://support.discord.com/hc/en-us/articles/360004027692-Requesting-a-Copy-of-your-Data",
  },
  {
    sourceKey: "slack_export",
    formatKey: "slack_json",
    icon: "#",
    nameKey: "import.source.slack.name",
    howtoKey: "import.source.slack.howto",
    tutorialUrl: "https://slack.com/help/articles/201658943-export-your-workspace-data",
  },
  {
    sourceKey: "github_activity",
    formatKey: "github_activity_json",
    icon: "{}",
    nameKey: "import.source.github.name",
    howtoKey: "import.source.github.howto",
    tutorialUrl:
      "https://docs.github.com/en/get-started/archiving-your-github-personal-account-and-public-repositories/requesting-an-archive-of-your-personal-accounts-data",
    welcomeOutlet: "github",
  },
  {
    sourceKey: "manual_paste",
    formatKey: "manual_paste",
    icon: "📋",
    nameKey: "import.source.paste.name",
    howtoKey: "import.source.paste.howto",
    tutorialUrl: null,
    welcomeOutlet: "paste",
  },
] as const;

export function getImportSource(formatKey: string): ImportSourceEntry | undefined {
  return IMPORT_SOURCES.find((s) => s.formatKey === formatKey);
}

export function importFormatKeys(): string[] {
  return IMPORT_SOURCES.map((s) => s.formatKey);
}
