# Text-tools redesign — progress (temporary, delete in the final round)

## Design rules (reference: word-counter)
- Appearance only: never change tool texts/copy or calculation semantics.
- Dynamic 2D visuals only (SVG/CSS, animated transitions). No 3D / react-three.
- Top = 3 columns via `ToolAboveFold` (input | result | RelatedToolsSidebar + ad), `stretchInput`/`stretchResult`.
- Instant result on load from a realistic sample text (all 6 locales), never zeros/empty.
- Result card: deep live table + live 2D visual side by side (see `WordCounterResult` + `CompositionRing`).
- Exactly 8 live indicators, each in `SectionCard` (title-only header) with adjacent WORKED EXAMPLE
  (`IndicatorWithTable`, wrapper like `WcIndicatorCard`); at least one interactive "wow" piece
  (click-to-select sentence, keyword highlight in textarea, sliders).
- Shared live state in a context (`WcLiveContext`): `useDeferredValue` + debounce for heavy analysis.
- Light/dark tokens (`dark:` classes), RTL (`dir="auto"` on text, `direction="ltr"` on SVG charts), 6 locales 1:1 keys.
- Counting: always use `@tooloralabs/tools` segmentation (`countWords`, `tokenizeWords`, `splitSentences`,
  `splitParagraphs`, `wordLength`, `normalizeWord`) — never `split(/\s+/)` or `[.!?]` regexes.

## Done
- Round 1: script-aware counting fix (`packages/tools/src/analyzers/textSegmentation.ts`, used by TextCounter,
  textProfile, ReadingTime, SpeechWordCount, LoremIpsum, Readability, TextToSpeech, SpeechToText, SpellingGrammar,
  web `ttsMath`, word-counter highlight) + tests (Arabic with/without diacritics, Hindi, English). word-counter.
- Round 2: readability-score-calculator (Rs* indicators, ScoreDial, package helpers `readabilityBreakdown`,
  `fleschReadingEaseOf`, `fleschKincaidGradeOf`, `readabilityBandFor` + tests), reading-time-calculator
  (Rt* indicators, ReadingDial, reader-playback wow piece).
- Round 3: speech-word-count-calculator (Sw* indicators, PaceRings, teleprompter wow piece with pace slider),
  lorem-ipsum-generator (Li* indicators, LiPageMockup, layout-playground wow piece; package constants
  `LOREM_COUNT_RANGE`/`LOREM_WORDS_PER_SENTENCE`/`LOREM_SENTENCES_PER_PARAGRAPH`, `loremWordBankSize`,
  `seededLoremRandom`, `loremWordRange` + tests; generation output unchanged).

## Remaining (text-tools category)
- Round 4: text-logo-generator
- Final round: lint, tsc, tests, build; delete this file; pull --rebase; push; CI; URL list.

## Problems / notes
- Readability keeps its contract: only terminated sentences count (text without end marks → `no-sentences`).
- `sgMath.sentencesOf` (spelling-grammar, English-only fixed samples) intentionally left as is.
- Readability sample text is English in all locales on purpose (formulas are English-only); it is `SAMPLE_TEXT`
  in `passageExamples.ts`. Its Clear button now empties the textarea; a "Load Sample Text" button restores it.
- Lorem: settings now regenerate live with the current seed; Generate = new seed, Clear = defaults + new seed.
  SSR/hydration uses seed 42, then a random seed after mount (text swaps once, never empty).
- Speech: pause-budget card is what-if only; the estimate stays pause-free. Docs pages of both tools untouched
  except lorem docs word-bank bars now read `loremWordBankSize`.
