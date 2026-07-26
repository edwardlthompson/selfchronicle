/** SoftConfirm helpers for destructive vault actions (ST-06). */

export function confirmWipe(typed: string, expected = "DELETE"): boolean {
  return typed.trim() === expected;
}
