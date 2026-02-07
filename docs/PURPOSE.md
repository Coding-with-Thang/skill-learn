# Archive directory (Achieve)

The **archive** directory at repo root (`/archive`) is used to store unused or archived files that may be needed for future reference but should not be included in the Git repository.

## Purpose

- Store deprecated or unused components
- Keep backup files that might be needed for rollback
- Archive old implementations before deletion
- Maintain files outside of version control

## Usage

When you have files that are no longer in use but might be needed later:

1. Move or copy the file to `archive/` at the repo root
2. Optionally rename with `.achieve` extension for clarity
3. The directory is ignored by Git via `/archive` in `.gitignore`

## Note

The `archive/` directory is excluded from Git tracking (`.gitignore`), so files there are not pushed. Do not keep critical or sole copies of code only in archive; use it for deprecated/unused backups and reference only.

