import { test } from "node:test";
import assert from "node:assert/strict";
import { compareColors } from "./color-lock.mjs";

const header = {
  light: ["rgb(21, 93, 252)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"],
  dark: ["rgb(21, 93, 252)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"],
};

test("identical colors pass", () => {
  assert.deepEqual(compareColors("/ar/tools/loan-calculator card header", header, structuredClone(header)), []);
});

test("one changed color fails, naming the element, property, old and new value", () => {
  const cur = structuredClone(header);
  cur.light[0] = "rgb(0, 122, 85)";
  assert.deepEqual(compareColors("/ar/tools/loan-calculator cards #0 \"قرضك\" header", header, cur), [
    '/ar/tools/loan-calculator cards #0 "قرضك" header light background-color: rgb(0, 122, 85) (approved rgb(21, 93, 252))',
  ]);
});

test("a dark-theme border change names the dark theme and border-color", () => {
  const cur = structuredClone(header);
  cur.dark[2] = "rgb(1, 2, 3)";
  assert.deepEqual(compareColors("x", header, cur), ["x dark border-color: rgb(1, 2, 3) (approved rgb(255, 255, 255))"]);
});

test("a baseline without colors fails until the colors are approved", () => {
  assert.deepEqual(compareColors("x", undefined, header), ["x: no approved colors in the baseline"]);
});

test("missing measured colors fail", () => {
  assert.deepEqual(compareColors("x", header, undefined), ["x: colors not measured"]);
});
