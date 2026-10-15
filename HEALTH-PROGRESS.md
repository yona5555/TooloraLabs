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
- macro-calculator (round 3)
- ideal-weight-calculator (round 3)
- sleep-calculator (round 4)
- pace-calculator (round 4)
- pregnancy-calculator (round 5)
- due-date-calculator (round 5)

## Remaining
- ovulation-calculator (final round: also do the cross-tool decisions listed in notes)

## Problems / notes
- Indicator cards use Western digits (same as BMICards); only result tables use the digit-style helper. Decide in final round whether to unify.
- Unused old keys left in messages: body-fat quickReference/measurementDiagram; target-heart-rate diagram/maxHrByAgeDiagram.
- Body fat (Navy) has no weight input: fat/lean mass card uses an assumed weight (BMI 22 for height), adjustable by slider.
- Target HR: Karvonen cards assume resting HR 60 bpm when none entered (labelled "typical, assumed").
- Round 2 main-session pass: drag handles covered value labels in several cards (BMR range strip/activity; TDEE steps/simulator/equations/formula). Fixed by moving labels clear of handles. Check this first in every new card.
- Unused old keys left: bmr diagram.ariaLabel, quickReference.*, result.difference; tdee componentBreakdownDiagram.*, education.intro.diagram.*.
- BMR has no body-fat input: the four-equations card seeds Katch-McArdle/Cunningham from the Deurenberg estimate (labelled). TDEE splits activity into NEAT (sedentary share) and exercise (the rest), a chosen convention, labelled in the table.
- 3D figure captions (BMI, BMR) show only their last line under the canvas: existing LiveTable3DLayout behaviour, same as the approved BMI. Decide in the final round.
- Round 3 (macro, ideal weight): no screenshots any more (new hard rule); subagents check layout by geometry/DOM values, Yousef reviews in the browser.
- Ideal weight: NEW optional "Current weight" input (default 80 kg, keys visuals.input.*) added for the difference-from-current rows. Needs Yousef's OK; if refused, switch to an assumed weight (BMI 25, already the fallback when empty).
- Ideal weight result table bottom snaps to the last whole row (IdealWeightResult only). BMI/BMR tables still slice a row at the bottom: decide in the final round whether to apply the same snap.
- Macro has no weight input: protein-per-kg uses a 70 kg reference (labelled, adjustable on the gauge card). Food protein values are approximate USDA figures. Disclaimer moved to a new "notices" section (§24).
- Unused old keys left: macro diagram.ariaLabel, quickReference.*, education.intro.carbGauge.*, education.goals.comparisonChart.*; ideal-weight formulaDiagram.*, heightCurve.*, education.intro.rangeGauge.*, aboveFold.placeholder, aboveFold.disclaimer.
- Fixed two round-1 lint errors (BodyFatCalculator setState in effect; HeartScene3D useMemo arg).
- Build note: next build is safe while the dev server runs on 3001 (Next 16 keeps dev output separate).
- Round 4 (sleep, pace): Sleep cards copy small SvgTrack/Card/useSharedStepper helpers from MacroCards (not exported there); final round could export them from macro-calculator and import instead. Sleep ladder "Yours" badge dropped (wrapped at 320px); selected row still highlighted. Sleep assumes adult 26-64 until an age group is picked; stage minutes per cycle are an approximate textbook model; wind-down offsets: caffeine 6 h, meal 3 h, lights 2 h, screens 1 h.
- Pace: WorldRecordsTable kept (education data table, not a drawing). Converter mode has no distance: result/cards use a 10 km effort (labelled). Timeline starts 08:00; goal card starts 5% faster. Multipoint with miles now shows segment distance/pace in miles (old table showed km values labelled as miles; display-only fix). PaceShareExportModal warns about duplicate React keys (rows "Pace"/"Speed" twice), pre-existing, left as is.
- Unused old keys left: sleep diagram.*, quickReference.*, byAgeDiagram.*, clockDiagram.*, result.cycles; pace quickReference.*, gauge.ariaLabel/ariaLabelEmpty, multipointSplitsChart.*, aboveFold.conceptDiagram.*.
- Round 5 (pregnancy, due date): pregnancy has a 3D uterus+fetus scene that grows by week; due date has a 3D 42-week board-game path (distinct). Both copy SvgTrack/Card/useSharedStepper again (now in Sleep, Pregnancy, DueDate cards): unify in the final round.
- Pregnancy: tool's trimester cut-offs (<13/<27 w) are 1 week earlier than ACOG (14+0/28+0); logic untouched, both shown and labelled. Decide later whether to fix in packages/tools. Assumes BMI 22 for IOM weight-gain card, birth model SD 10 days, 28-day cycle, low-risk visit schedule. Some formula cells keep "LMP"/"w/d" in Latin in Arabic.
- Due date: DEFAULT CHANGED from LMP = today (0w0d) to LMP 70 days ago (10+0) so the page loads with a real result; Clear resets to that default. Needs Yousef's OK. No ultrasound input mode exists (only via redating card, ACOG CO 700). Share modal dates now use the visitor locale (Western digits) instead of always en-US.
- Both: "today" computed on server and client (as before), so a hydration mismatch is possible around midnight.
- Unused old keys left: pregnancy diagram.*, quickReference.*, education.intro.weekGauge.*; due-date diagram.*, quickReference.*, trimesterDiagram.*, education.intro.weekGauge.*.
