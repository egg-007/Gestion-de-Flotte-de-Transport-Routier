import test from "node:test";
import assert from "node:assert/strict";
import {
  hasDateOverlap,
  isMaintenanceDue,
  isValidMileage,
} from "../utils/businessRules.js";

test("arrival mileage must be greater than departure mileage", () => {
  assert.equal(isValidMileage(100, 101), true);
  assert.equal(isValidMileage(100, 100), false);
  assert.equal(isValidMileage(100, 99), false);
});
test("overlapping assignments are detected", () => {
  assert.equal(
    hasDateOverlap(
      new Date("2026-10-01"),
      new Date("2026-10-05"),
      new Date("2026-10-04"),
      new Date("2026-10-06"),
    ),
    true,
  );
  assert.equal(
    hasDateOverlap(
      new Date("2026-10-01"),
      new Date("2026-10-03"),
      new Date("2026-10-03"),
      new Date("2026-10-06"),
    ),
    false,
  );
});
test("maintenance threshold triggers at or above threshold", () => {
  assert.equal(isMaintenanceDue(20000, 20000), true);
  assert.equal(isMaintenanceDue(19999, 20000), false);
});
