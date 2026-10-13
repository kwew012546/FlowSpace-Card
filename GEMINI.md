# 🛡️ Project Guardrails (8 Pragmatic Laws & Defensive QA Mindset)

> **🧠 Core Axiom: Developer + QA Dual Mindset (สร้างด้วยความหวัง แต่ตรวจด้วยสายตา QA):**  
> Never write code solely with the builder's optimism (*"Happy Path"*). Simultaneously adopt the **Senior QA & Chaos Engineering mindset** before declaring any task complete:
> 1. *"How will a distracted, non-ideal human break or misuse this flow?"* (e.g. typos, uppercase emails, double-clicks, switching tabs, expired tokens)
> 2. *"How will the real-world environment betray this code?"* (e.g. network drops, mobile lock screens, read-only serverless disks, thermal throttling)
> 3. *"Where will two business or security rules collide into an inescapable deadlock/soft-lock?"*
> Actively identify failure modes, edge cases, and humane recovery paths *before* the user encounters them.

Follow these 8 universal engineering principles across all code modifications:

1. **Signal-to-Noise Ratio (Quiet UX):** Never spawn unsolicited toasts, alerts, or popup banners for routine, trivial, or successful actions. Use quiet, contextual, inline feedback (e.g. temporary button label change `📋 Copy` → `✅ Copied`, subtle checkmarks). Reserve intrusive popups exclusively for destructive actions or critical errors.
2. **Single Primary Action:** Every screen state (Empty, Loading, Content View) must have exactly ONE unambiguous Primary Call-to-Action (CTA). When an Empty State hero card acts as the primary action, suppress duplicate header/toolbar buttons.
3. **Closed-Loop UX:** Mutations must immediately reflect on screen without requiring an F5 page refresh (Optimistic UI / instant reactive sync). If an action has a logical next step (e.g. room joined, logged in), smoothly auto-navigate the user to the destination immediately.
4. **Deployment Parity & Zero-Breaking-Change:** Never assume production cloud environments mirror local machines. Prefer Zero-Migration solutions (using existing columns/fields) before altering database schemas to avoid breaking cloud environments (e.g. Vercel / Neon / Supabase).
5. **Real-Device Empathy & Fluid Responsive:** Always engineer for real mobile devices. No horizontal overflow (lock X-axis), use `100dvh` instead of `100vh` to avoid mobile address-bar clipping, ensure touch targets are at least 44×44px with zero dependence on hover states, and reduce heavy GPU/blur effects on mobile to prevent overheating and battery drain.
6. **Fail-Safe & Graceful Degradation:** External dependencies will fail. Never use fatal process exits (`process.exit`) in serverless environments. Catch errors gracefully and return human-readable recovery guidance instead of technical 500 error pages.
7. **Pre-Flight Reality Check:** Always run build verification (`npm run build`, typechecks, or tests) and review git diffs before declaring any task complete. Never let the user be the first person to encounter a build or runtime failure.
8. **Dead-End Immune & Human-Realistic Recovery:** Never design solely for the "Happy Path". Real humans get distracted, forget to check emails within 15 minutes, click expired links, or disconnect mid-flow. Every system flow and finite state must have a guaranteed, humane recovery path. Never let security rules collide into deadlocks/soft-locks (e.g. unverified users trapped because tokens expired while unique constraints block re-registration). Every error/expired state must provide an immediate actionable way forward (1-click resend, auto-renewal, or graceful retry).
