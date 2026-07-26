import type { CuriosityItem } from "../curiosity";

export const MAX_MORALITY_QUESTIONS = 3;

export type G2kQuestion = {
  id: string;
  question: string;
  tags: string[];
};

export type G2kSession = {
  kind: "getting_to_know_you";
  asked: G2kQuestion[];
  skippedIds: string[];
  answeredIds: string[];
  done: boolean;
};

const MORALITY_TAGS = new Set(["morality", "getting_to_know_you"]);

export function isMoralityItem(item: CuriosityItem): boolean {
  return item.tags.some((t) => MORALITY_TAGS.has(t));
}

export function startG2kSession(pool: CuriosityItem[]): G2kSession {
  const morality = pool
    .filter((i) => i.status === "open" && isMoralityItem(i))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, MAX_MORALITY_QUESTIONS)
    .map((i) => ({ id: i.id, question: i.question, tags: i.tags }));

  return {
    kind: "getting_to_know_you",
    asked: morality,
    skippedIds: [],
    answeredIds: [],
    done: morality.length === 0,
  };
}

export function currentQuestion(session: G2kSession): G2kQuestion | null {
  const resolved = new Set([...session.skippedIds, ...session.answeredIds]);
  return session.asked.find((q) => !resolved.has(q.id)) ?? null;
}

export function skipQuestion(session: G2kSession, id: string): G2kSession {
  if (session.skippedIds.includes(id) || session.answeredIds.includes(id)) {
    return session;
  }
  const skippedIds = [...session.skippedIds, id];
  const resolved = skippedIds.length + session.answeredIds.length;
  return {
    ...session,
    skippedIds,
    done: resolved >= session.asked.length,
  };
}

export function answerQuestion(session: G2kSession, id: string): G2kSession {
  if (session.answeredIds.includes(id) || session.skippedIds.includes(id)) {
    return session;
  }
  const answeredIds = [...session.answeredIds, id];
  const resolved = answeredIds.length + session.skippedIds.length;
  return {
    ...session,
    answeredIds,
    done: resolved >= session.asked.length,
  };
}

export function moralityCap(session: G2kSession): number {
  return Math.min(session.asked.length, MAX_MORALITY_QUESTIONS);
}
