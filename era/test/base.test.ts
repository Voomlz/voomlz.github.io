import { test, expect, describe } from "vitest";
import {
  getThreatCoefficient,
  getAdditiveThreatCoefficient,
  applyThreatCoefficient,
  BASE_COEFFICIENT,
  School,
} from "../base.js";

describe("Core Threat Calculation Functions", () => {
  describe("getThreatCoefficient", () => {
    test("returns a function that returns the provided value for any spell school", () => {
      const coeff = getThreatCoefficient(1.5);
      expect(coeff()).toBe(1.5);
      expect(coeff(School.Physical)).toBe(1.5);
      expect(coeff(School.Fire)).toBe(1.5);
    });

    test("returns a function that returns school-specific values when provided", () => {
      const values = {
        [School.Physical]: 1.3,
        [School.Fire]: 0.8,
        [School.Shadow]: 1.1,
        0: 1.0, // Default value
      };
      const coeff = getThreatCoefficient(values);

      expect(coeff(School.Physical)).toBe(1.3);
      expect(coeff(School.Fire)).toBe(0.8);
      expect(coeff(School.Shadow)).toBe(1.1);
      expect(coeff(School.Frost)).toBe(1.0); // Uses default
      expect(coeff()).toBe(1.0); // Default when no school provided
    });

    test("defaults to 1 for spell schools that are not provided", () => {
      const values = {
        [School.Fire]: 1.2,
      };
      const coeff = getThreatCoefficient(values);

      expect(coeff()).toBe(1);
      expect(coeff(School.Physical)).toBe(1);
      expect(coeff(School.Fire)).toBe(1.2);
    });
  });

  describe("getAdditiveThreatCoefficient", () => {
    test("correctly calculates additive threat coefficient", () => {
      // For example, if base is 100 and value is 30, should return 1.3
      const coeff = getAdditiveThreatCoefficient(30, 100);
      expect(coeff()).toBe(1.3);
    });

    test("handles negative values correctly", () => {
      const coeff = getAdditiveThreatCoefficient(-20, 100);
      expect(coeff()).toBe(0.8);
    });
  });

  describe("applyThreatCoefficient", () => {
    test("applies a coefficient to a threat value", () => {
      const initialCoeff = {
        value: 1.5,
        debug: [{ value: 1.5, label: "Initial" }],
      };
      const result = applyThreatCoefficient(initialCoeff, 100, "Test");

      expect(result.value).toBe(150);
      expect(result.debug).toEqual([
        { value: 1.5, label: "Initial" },
        { value: 100, label: "Test" },
      ]);
    });

    test("adds a label even for a 1.0 coefficient", () => {
      const initialCoeff = {
        value: 1.5,
        debug: [{ value: 1.5, label: "Initial" }],
      };
      const result = applyThreatCoefficient(initialCoeff, 1.0, "noop");

      expect(result).toEqual({
        value: 1.5,
        debug: [
          { value: 1.5, label: "Initial" },
          { value: 1.0, label: "noop" },
        ],
      });
    });

    test("applies multiple coefficients sequentially", () => {
      const baseCoeff = BASE_COEFFICIENT;

      // Apply first coefficient (e.g., base class coefficient)
      const firstCoeff = applyThreatCoefficient(
        baseCoeff,
        1.5,
        "Warrior (base)"
      );

      expect(firstCoeff).toEqual({
        value: 1.5,
        debug: [{ value: 1.5, label: "Warrior (base)" }],
      });

      // Apply second coefficient (e.g., stance coefficient)
      const secondCoeff = applyThreatCoefficient(
        firstCoeff,
        1.3,
        "Defensive Stance"
      );

      expect(secondCoeff).toEqual({
        value: 1.5 * 1.3,
        debug: [
          { value: 1.5, label: "Warrior (base)" },
          { value: 1.3, label: "Defensive Stance" },
        ],
      });

      // Apply a damage value
      const finalThreat = applyThreatCoefficient(
        secondCoeff,
        100,
        "Sunder Armor"
      );

      expect(finalThreat).toEqual({
        value: 1.5 * 1.3 * 100,
        debug: [
          { value: 1.5, label: "Warrior (base)" },
          { value: 1.3, label: "Defensive Stance" },
          { value: 100, label: "Sunder Armor" },
        ],
      });
    });

    test("includes bonus threat in debug", () => {
      const initialCoeff = {
        value: 1.5,
        debug: [{ value: 1.5, label: "Initial" }],
      };
      const result = applyThreatCoefficient(initialCoeff, 2, "Ability", 100);

      expect(result).toEqual({
        value: 3,
        debug: [
          { value: 1.5, label: "Initial" },
          { value: 2, label: "Ability", bonus: 100 },
        ],
      });
    });
  });
});
