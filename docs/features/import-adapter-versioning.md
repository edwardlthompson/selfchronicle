# Feature: import-adapter-versioning

- ✅ Each adapter pins `parser_version` (e.g. `grok_json_v1`)
- ✅ Unknown top-level fields → `raw_sidecar` on the review (not silently dropped without record)
- ✅ Review-before-commit unchanged; no silent scrape
