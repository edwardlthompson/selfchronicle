/** Shared seed pack shape for welcome/Drive imports. No personal data ships in the app. */

export type SeedFact = { title: string; body: string };

export type SeedEvidence = {
  title: string;
  body: string;
  tags: string[];
  source: "other_archive";
  channel: "other";
};

export type SeedChapter = { title: string; body: string };

export type SeedBundle = {
  evidence: SeedEvidence[];
  chapters: SeedChapter[];
  facts: SeedFact[];
};
