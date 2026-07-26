import { chatgptAdapter } from "./adapters/chatgpt";
import { pasteAdapter } from "./adapters/paste";
import { getAdapterForFormat } from "./adapters/registry";
import { isMemoryDisclosureMarkdown } from "./adapters/memoryDisclosure";
import { commitImportReview } from "./commit";
import {
  getImportReview,
  getImportSelectedFormat,
  setImportReview,
  setImportSelectedFormat,
} from "./session";
import type { ProfileVault } from "../vault";

export function bindImportPanel(
  root: HTMLElement,
  vault: ProfileVault,
  onChange: () => void,
): void {
  const raw = () => root.querySelector<HTMLTextAreaElement>("[data-import-raw]")?.value ?? "";

  root.querySelectorAll<HTMLElement>("[data-import-select-format]").forEach((el) => {
    el.addEventListener("click", () => {
      const fmt = el.dataset.importSelectFormat ?? "manual_paste";
      setImportSelectedFormat(fmt);
      onChange();
    });
  });

  const parseText = (text: string) => {
    const adapter = getAdapterForFormat(getImportSelectedFormat());
    void adapter
      .parse(text)
      .then((r) => {
        setImportReview(r);
        onChange();
      })
      .catch(() => {
        setImportReview(null);
        onChange();
      });
  };

  root.querySelector("[data-import-parse-selected]")?.addEventListener("click", () => {
    parseText(raw());
  });

  root.querySelector<HTMLInputElement>("[data-import-file]")?.addEventListener("change", (ev) => {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.name.toLowerCase().endsWith(".zip")) {
      window.alert(
        "Unzip the xAI archive first, then choose prod-grok-backend.json (file import does not open ZIP yet).",
      );
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const area = root.querySelector<HTMLTextAreaElement>("[data-import-raw]");
      if (area && text.length < 200_000) area.value = text;
      if (isMemoryDisclosureMarkdown(text)) {
        setImportSelectedFormat("memory_disclosure_md");
      }
      parseText(text);
    };
    reader.readAsText(file);
  });
  root.querySelector("[data-import-parse-paste]")?.addEventListener("click", () => {
    setImportSelectedFormat("manual_paste");
    void pasteAdapter.parse(raw()).then((r) => {
      setImportReview(r);
      onChange();
    });
  });
  root.querySelector("[data-import-parse-chatgpt]")?.addEventListener("click", () => {
    setImportSelectedFormat("chatgpt_json");
    void chatgptAdapter.parse(raw()).then((r) => {
      setImportReview(r);
      onChange();
    });
  });
  root.querySelector("[data-import-commit]")?.addEventListener("click", () => {
    const r = getImportReview();
    if (!r) return;
    void commitImportReview(vault, r).then(() => {
      setImportReview(null);
      onChange();
    });
  });
  root.querySelector("[data-import-cancel]")?.addEventListener("click", () => {
    setImportReview(null);
    onChange();
  });
}
