---
description: Code Review Workflow - Analyzes changes for bugs, security, and style.
---

# Code Review Workflow

When triggered, perform the following steps:

1. **Analyze Changes:** Review the diff of new or modified files.
2. **Bug Check:**
   - Look for common React/3D pitfalls (e.g., missing dependencies in `useMemo`, `ReferenceError` on globals like `ROWS`/`COLS`).
   - Verify collision logic integrity in `gameStore.ts`.
3. **Security Audit:** Check for hardcoded secrets or unsafe asset loading.
4. **Style Check:** Verify compliance with `.agents/rules/format.md`.
5. **Performance Check:** Ensure `InstancedMesh` is used correctly and `useFrame` isn't doing heavy calculations.
6. **Output:** Provide a summary with:
   - 🔴 **Critical:** Crashes or logic breaks.
   - 🟡 **Warning:** Style issues or performance concerns.
   - 🟢 **Info:** General feedback.
