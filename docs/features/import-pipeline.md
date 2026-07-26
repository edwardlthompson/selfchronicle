# Feature: import-pipeline

## Stages

guide → stage → parse → review → commit → audit

## Acceptance

- ✅ Adapter interface with required `parser_version`
- ✅ ChatGPT JSON conversations adapter (minimal)
- ✅ Manual paste adapter
- ✅ Review counts before commit
- ✅ No silent scraping

## Hard rule

Only user-initiated official exports + paste/share.
