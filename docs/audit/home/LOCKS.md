# Home Page Audit - File Locks

This file tracks which agent is editing which files to prevent collisions.

## Agent 1 - UX/UI/AX Audit
**Status:** ✅ Complete
**Files to edit:**
- libs/screens/src/lib/HomeScreen.tsx
- libs/sections/src/lib/HeroSection.tsx
- libs/sections/src/lib/StartHereSection.tsx
- libs/sections/src/lib/ListSection.tsx
- libs/sections/src/lib/CardGridSection.tsx
- libs/sections/src/lib/FrameworkCard.tsx
- apps/web/src/styles/20-layout.css
- apps/web/src/styles/30-components.css
- apps/web/src/styles/40-utilities.css
- docs/audit/home/agent1-ux-ui-ax.md
- docs/audit/home/CHANGE_REQUESTS.md (append only)

## Agent 2 - Content/SEO/IA Audit
**Status:** ✅ Complete
**Files to edit:**
- libs/seo/src/lib/seo.ts (ONLY functions used by Home metadata/json-ld)
- apps/web/src/app/[locale]/page.tsx (Home metadata usage)
- libs/content/src/lib/content.ts (ONLY getFrameworkList if needed)
- docs/audit/home/agent2-content-seo-ia.md
- docs/audit/home/CHANGE_REQUESTS.md (append only)

## Agent 3 - Engineering/Runtime/DI Audit
**Status:** ✅ Complete
**Files to edit:**
- apps/web/src/app/[locale]/page.tsx
- libs/screens/src/lib/HomeScreen.tsx
- libs/sections/src/lib/* (ONLY used by Home)
- docs/audit/home/agent3-engineering-runtime.md
- docs/audit/home/CHANGE_REQUESTS.md (append only)

## Agent 4 - Systems/Docs/Integration
**Status:** ✅ Complete
**Files to edit:**
- docs/audit/home/*
- docs/content-operating-system.md (ONLY if needed to clarify Home)
- docs/page-intent-map.md (ONLY if needed to clarify Home)
- apps/web/src/styles/00-tokens.css
- apps/web/src/styles/10-base.css
- apps/web/src/styles/index.css
- apps/web/src/styles/app-layers.css
- apps/web/src/app/[locale]/layout.tsx (global header/footer systems)
- libs/ui/* (if header/footer components live here)
- Any file explicitly listed in docs/audit/home/CHANGE_REQUESTS.md
