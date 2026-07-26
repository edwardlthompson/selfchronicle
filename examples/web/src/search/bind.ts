/** Wire audit search input (PD-13). */
export function bindVaultSearch(root: HTMLElement, onQuery: (q: string) => void): void {
  root.querySelector("[data-vault-search]")?.addEventListener("input", (e) => {
    onQuery((e.target as HTMLInputElement).value);
  });
}
