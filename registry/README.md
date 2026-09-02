# Feature Registry & Working Logs (`registry/`)

This directory is the root-level source of truth for **tracking features, progress logs, and verification steps** across all developers and AI agents.

---

## 📋 Active Tracking Files

- **[`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md)**:  
  The primary source of truth tracking all features (`FEAT-000`, `FEAT-001`, `FEAT-002`, `FEAT-BE-001`, etc.), their implementation status, affected files, exposed endpoints/components, and step-by-step verification commands.

---

## ✍️ How to Log Your Work

Whenever adding or changing a feature:
1. Open [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md).
2. Add or update the entry in the **Summary Status Board** table.
3. Add a detailed log entry under **Detailed Feature Log** using the template at the bottom of the file.
4. Ensure you include the exact commands, Swagger URL, or UI steps for someone else to view and verify what you built.
