# A11Y-PROGRESS (branch fix/a11y-zero)
- [x] Step 0: PR #5 merged (269c0f2a)
- [~] 1 contrast: token layer in apps/web/app/globals.css ("text color tokens: WCAG AA"). Light: per variant
      (navy/teal/violet) zinc-400/500 + every hue 600/700 that failed; dark: zinc-500. Table below.
      LEFT: ~261 nodes = white text on light 500 fills (badges, bar segments, calculator keys incl. the
      orange key), text-*-500 used as text (fix in components -> 600), opacity-60 / */80 text,
      hard-coded hex chart labels. Then home-phone baselines (--approve + CI label) + APPROVED — LOCKED note.
- [~] 2 axe /en light: 16597 -> 273 nodes (261 contrast, 12 dlitem). Fixed: nav landmark labels,
      IndicatorWithTable/WxSplit/break-even dl structure, slider aria-valuetext (GlassHandle),
      Mafs canvas role=group, scroll regions tabIndex, empty th, labels/select names, tablist,
      ol children, svg names, heading order, nested-interactive.
      LEFT: dark scan (before: 6824 nodes, mostly dark:text-zinc-500 + white on dark:bg-blue-500 badge),
      10 /ar pages, 390px scan.
- [ ] 3 katex: npm audit = 2 low (katex <=0.18.1 via mafs 0.21 -> katex ^0.16). No app code renders
      KaTeX (mafs LaTeX unused). Plan: root package.json "overrides": {"katex": "^0.19.1"}, verify 0 .katex
      nodes before/after + Mafs DOM rect diff.
- [ ] 4 WebGL warnings (chemistry tools, ideal-weight)
- [ ] verify (Lighthouse a11y 100, DOM diff, test:cards, test:home-phone) / PR

## Token changes (old -> new, worst ratio on that variant's light surfaces)
| scope | token | old | new |
|---|---|---|---|
| light navy | --color-zinc-400 | #9f9fa9 (2.10) | #666670 (4.55) |
| light navy | --color-zinc-500 | #71717b (3.87) | #666671 (4.55) |
| light navy | --color-red-600 | #e7000b (3.83) | #d20000 (4.50) |
| light navy | --color-orange-600 | #f54900 (2.89) | #cd1800 (4.52) |
| light navy | --color-orange-700 | #ca3500 (4.19) | #c42e00 (4.51) |
| light navy | --color-amber-600 | #e17100 (2.57) | #b14500 (4.53) |
| light navy | --color-amber-700 | #bb4d00 (4.04) | #b14400 (4.56) |
| light navy | --color-yellow-600 | #d08700 (2.36) | #9b5500 (4.56) |
| light navy | --color-yellow-700 | #a65f00 (3.96) | #9b5500 (4.56) |
| light navy | --color-lime-600 | #5ea500 (2.46) | #327600 (4.52) |
| light navy | --color-lime-700 | #497d00 (4.00) | #407400 (4.53) |
| light navy | --color-green-600 | #00a63e (2.58) | #007904 (4.51) |
| light navy | --color-green-700 | #008236 (3.97) | #00782c (4.53) |
| light navy | --color-emerald-600 | #009966 (2.93) | #007747 (4.52) |
| light navy | --color-emerald-700 | #007a55 (4.30) | #007652 (4.54) |
| light navy | --color-teal-600 | #009689 (2.94) | #007469 (4.55) |
| light navy | --color-teal-700 | #00786f (4.30) | #00746c (4.54) |
| light navy | --color-cyan-600 | #0092b8 (2.90) | #006f94 (4.55) |
| light navy | --color-cyan-700 | #007595 (4.23) | #007090 (4.53) |
| light navy | --color-sky-600 | #0084d1 (3.23) | #006ab6 (4.51) |
| light navy | --color-blue-600 | #155dfc (4.21) | #0f57f6 (4.54) |
| light navy | --color-purple-600 | #9810fa (4.45) | #970cf9 (4.51) |
| light navy | --color-fuchsia-600 | #c800de (3.74) | #b200c9 (4.51) |
| light navy | --color-pink-600 | #e60076 (3.64) | #cc0062 (4.50) |
| light navy | --color-rose-600 | #ec003f (3.63) | #d0002a (4.53) |
| light teal | --color-zinc-400 | #9f9fa9 (2.04) | #64646e (4.54) |
| light teal | --color-zinc-500 | #71717b (3.75) | #64646f (4.54) |
| light teal | --color-red-600 | #e7000b (3.70) | #cd0000 (4.53) |
| light teal | --color-orange-600 | #f54900 (2.79) | #ca1200 (4.53) |
| light teal | --color-orange-700 | #ca3500 (4.06) | #c12b00 (4.51) |
| light teal | --color-amber-600 | #e17100 (2.48) | #af4200 (4.53) |
| light teal | --color-amber-700 | #bb4d00 (3.91) | #af4200 (4.53) |
| light teal | --color-yellow-600 | #d08700 (2.28) | #995300 (4.54) |
| light teal | --color-yellow-700 | #a65f00 (3.83) | #995400 (4.50) |
| light teal | --color-lime-600 | #5ea500 (2.38) | #2f7400 (4.51) |
| light teal | --color-lime-700 | #497d00 (3.87) | #3f7200 (4.51) |
| light teal | --color-green-600 | #00a63e (2.50) | #007600 (4.54) |
| light teal | --color-green-700 | #008236 (3.84) | #007529 (4.56) |
| light teal | --color-emerald-600 | #009966 (2.84) | #007444 (4.55) |
| light teal | --color-emerald-700 | #007a55 (4.16) | #007450 (4.51) |
| light teal | --color-teal-600 | #009689 (2.85) | #007267 (4.53) |
| light teal | --color-teal-700 | #00786f (4.16) | #00726a (4.51) |
| light teal | --color-cyan-600 | #0092b8 (2.81) | #006d92 (4.53) |
| light teal | --color-cyan-700 | #007595 (4.10) | #006e8e (4.50) |
| light teal | --color-sky-600 | #0084d1 (3.12) | #0067b2 (4.55) |
| light teal | --color-blue-600 | #155dfc (4.07) | #0d55f4 (4.50) |
| light teal | --color-purple-600 | #9810fa (4.30) | #9501f6 (4.51) |
| light teal | --color-fuchsia-600 | #c800de (3.61) | #ae00c5 (4.52) |
| light teal | --color-pink-600 | #e60076 (3.52) | #c8005f (4.50) |
| light teal | --color-rose-600 | #ec003f (3.52) | #cc0026 (4.53) |
| light violet | --color-zinc-400 | #9f9fa9 (1.85) | #5e5e68 (4.51) |
| light violet | --color-zinc-500 | #71717b (3.40) | #5e5e69 (4.51) |
| light violet | --color-red-600 | #e7000b (3.36) | #c10000 (4.53) |
| light violet | --color-orange-600 | #f54900 (2.53) | #c10000 (4.53) |
| light violet | --color-orange-700 | #ca3500 (3.68) | #b92100 (4.51) |
| light violet | --color-amber-600 | #e17100 (2.25) | #a73b00 (4.52) |
| light violet | --color-amber-700 | #bb4d00 (3.54) | #a73b00 (4.52) |
| light violet | --color-yellow-600 | #d08700 (2.07) | #924d00 (4.50) |
| light violet | --color-yellow-700 | #a65f00 (3.47) | #924d00 (4.50) |
| light violet | --color-lime-600 | #5ea500 (2.16) | #296d00 (4.51) |
| light violet | --color-lime-700 | #497d00 (3.51) | #386b00 (4.52) |
| light violet | --color-green-600 | #00a63e (2.27) | #006f00 (4.52) |
| light violet | --color-green-700 | #008236 (3.48) | #006e22 (4.54) |
| light violet | --color-emerald-600 | #009966 (2.57) | #006d3e (4.54) |
| light violet | --color-emerald-700 | #007a55 (3.78) | #006d49 (4.50) |
| light violet | --color-teal-600 | #009689 (2.58) | #006b60 (4.52) |
| light violet | --color-teal-700 | #00786f (3.78) | #006b63 (4.50) |
| light violet | --color-cyan-600 | #0092b8 (2.55) | #00668b (4.52) |
| light violet | --color-cyan-700 | #007595 (3.72) | #006786 (4.50) |
| light violet | --color-sky-600 | #0084d1 (2.83) | #0060ab (4.53) |
| light violet | --color-sky-700 | #0069a8 (4.12) | #0062a1 (4.53) |
| light violet | --color-blue-600 | #155dfc (3.69) | #044dec (4.51) |
| light violet | --color-violet-600 | #7f22fe (4.15) | #7a14f7 (4.52) |
| light violet | --color-purple-600 | #9810fa (3.90) | #8a00e9 (4.54) |
| light violet | --color-fuchsia-600 | #c800de (3.28) | #a300ba (4.53) |
| light violet | --color-fuchsia-700 | #a800b7 (4.42) | #a500b4 (4.54) |
| light violet | --color-pink-600 | #e60076 (3.20) | #bc0056 (4.52) |
| light violet | --color-pink-700 | #c6005c (4.16) | #bc0054 (4.53) |
| light violet | --color-rose-600 | #ec003f (3.19) | #c1001d (4.50) |
| light violet | --color-rose-700 | #c70036 (4.25) | #c00031 (4.50) |
| dark (all) | --color-zinc-500 | #71717b (3.09) | #8d8d98 (4.54) |
