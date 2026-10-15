# Health-fitness redesign progress (delete before merging to main)

## Design rules (BMI = reference: apps/web/components/tools/bmi-calculator/)
- Appearance only: no text or calculation-logic changes (packages/tools untouched).
- Delete old drawings + indicator cards.
- Top = 3 columns (inputs | result | sidebar), instant result on load, live on every valid edit, no empty space.
- Result card: deep live table left, live drawing right (3D where it fits, else rich 2D).
- Exactly 8 new live §31 indicators, ≥1 interactive "wow"; SectionCard title-only header + adjacent WORKED EXAMPLE, where old drawings were.
- WHO / standard medical formulas. Light/dark, RTL, 6 locales.
- Reuse BMI pieces (e.g. ../bmi-calculator/BMIFigureScene3D, now has optional `fatLayer` prop) instead of copying. No shared components outside health tool folders. Only health-fitness keys in locale files. Port 3001.
- Rounds of 2 tools by 2 parallel subagents. Subagents do NOT edit messages/*.json: they write `tools.<slug>.visuals` fragments to scratchpad i18n/<slug>.<locale>.json; the main session merges them (key parity checked) to avoid write races.

## Done
- bmi-calculator (pilot)
- body-fat-calculator (round 1)
- target-heart-rate-calculator (round 1)
- bmr-calculator (round 2)
- tdee-calculator (round 2)

## Remaining
- macro-calculator, ideal-weight-calculator
- sleep-calculator, pace-calculator
- pregnancy-calculator, due-date-calculator
- ovulation-calculator

## Problems / notes
- Indicator cards use Western digits (same as BMICards); only result tables use the digit-style helper. Decide in final round whether to unify.
- Unused old keys left in messages: body-fat quickReference/measurementDiagram; target-heart-rate diagram/maxHrByAgeDiagram.
- Body fat (Navy) has no weight input: fat/lean mass card uses an assumed weight (BMI 22 for height), adjustable by slider.
- Target HR: Karvonen cards assume resting HR 60 bpm when none entered (labelled "typical, assumed").
- Round 2 main-session pass: drag handles covered value labels in several cards (BMR range strip/activity; TDEE steps/simulator/equations/formula). Fixed by moving labels clear of handles. Check this first in every new card.
- Unused old keys left: bmr diagram.ariaLabel, quickReference.*, result.difference; tdee componentBreakdownDiagram.*, education.intro.diagram.*.
- BMR has no body-fat input: the four-equations card seeds Katch-McArdle/Cunningham from the Deurenberg estimate (labelled). TDEE splits activity into NEAT (sedentary share) and exercise (the rest), a chosen convention, labelled in the table.
- 3D figure captions (BMI, BMR) show only their last line under the canvas: existing LiveTable3DLayout behaviour, same as the approved BMI. Decide in the final round.
- Build note: next build is safe while the dev server runs on 3001 (Next 16 keeps dev output separate).
