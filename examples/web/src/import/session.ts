import type { ImportReview } from "./types";

let review: ImportReview | null = null;
let selectedFormat = "manual_paste";

export function getImportReview(): ImportReview | null {
  return review;
}

export function setImportReview(next: ImportReview | null): void {
  review = next;
}

export function getImportSelectedFormat(): string {
  return selectedFormat;
}

export function setImportSelectedFormat(formatKey: string): void {
  selectedFormat = formatKey || "manual_paste";
}
