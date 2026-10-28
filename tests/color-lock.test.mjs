import { test } from "node:test";
import assert from "node:assert/strict";
import { compareColors, compareControls } from "./color-lock.mjs";

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

const button = {
  light: ["rgb(21, 93, 252)", "rgb(255, 255, 255)", "rgb(21, 93, 252)"],
  dark: ["rgb(81, 162, 255)", "rgb(3, 7, 18)", "rgb(81, 162, 255)"],
};

test("a changed button color in main fails, naming the button, property, old and new value", () => {
  const labels = ["button Calculate", "a Learn more"];
  const base = [{ element: button }, { element: structuredClone(header) }];
  const cur = structuredClone(base);
  cur[0].element.dark[0] = "rgb(0, 166, 62)";
  assert.deepEqual(compareControls("/en/tools/loan-calculator", labels, base, [...labels], cur), [
    '/en/tools/loan-calculator controls #0 "button Calculate" element dark background-color: rgb(0, 166, 62) (approved rgb(81, 162, 255))',
  ]);
});

test("unchanged controls pass", () => {
  const labels = ["tab \"Monthly\"", "select \"currency\""];
  const base = [{ element: button }, { element: header }];
  assert.deepEqual(compareControls("v", labels, base, [...labels], structuredClone(base)), []);
});

test("an added control or a baseline without controls fails", () => {
  const base = [{ element: button }];
  assert.deepEqual(compareControls("v", ["button \"A\""], base, ["button \"A\"", "a \"B\""], [...base, { element: header }]), ["v controls: 2 (approved 1)"]);
  assert.deepEqual(compareControls("v", undefined, undefined, ["button \"A\""], base), ["v controls: no approved colors in the baseline"]);
});
