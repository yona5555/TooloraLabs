// Gate canary (tests/gates-self-test.mjs): system font declarations the system font rule must fail on.
export const Broken = () => (
  <svg>
    <text fontFamily="ui-monospace, monospace">12.5</text>
    <text style={{ fontFamily: "Arial, sans-serif" }}>x</text>
  </svg>
);
export const css = `.label { font-family: Menlo, monospace; }`;
export function draw(ctx: CanvasRenderingContext2D) {
  ctx.font = `600 12px system-ui`;
}
