# Priority-based editorial workflow

The project intentionally has no day-based calendar.

## Priority order

- P0: technical, legal, trust and compliance foundation
- P1: Air Fryer and Blender hubs, pillars and highest-intent pages
- P2: deeper authority, comparisons, reviews, Kettles and Toaster Ovens
- P3: Food Processors, Mini Choppers, Rice Cookers and Coffee Grinders
- P4: future topics requiring live SERP and product validation

## Complete a draft page

1. Open the matching JSON file in `content/pages/`.
2. Keep the supplied H1, intent and structure unless live SERP research proves a
   better non-cannibalising direction.
3. Write a direct summary.
4. Replace section briefs with complete original paragraphs and useful lists.
5. Add verified sources and evidence notes in the content or editorial system.
6. Fill product slots in `data/product-import-template.csv`.
7. Run `npm run products:generate`.
8. Add useful FAQs only when they are genuinely needed.
9. Review related page IDs and internal links.
10. Set `publishedAt`, `updatedAt`, `draft: false` and `noindex: false`.
11. Run validation, lint and build.
12. Preview on mobile and desktop before merging.

## Review-page rule

A research-based review must say that it is research-based. A page may mention
hands-on tests only when those tests occurred and the evidence is documented.

## Update-date rule

Do not change an update date merely to make content appear fresh. Change it
only after a meaningful editorial or product update.
