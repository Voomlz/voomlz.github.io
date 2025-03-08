import { test, expect, describe, vi } from "vitest";
import { ThreatTrace } from "../threat/unit.js";

describe("ThreatTrace", () => {
  test("initializes with correct values", () => {
    // Create mock unit and fight
    const mockUnit = {
      key: "target1",
      threatCoeff: () => ({ value: 1.5, debug: [] }),
      border: [0, null],
      invulnerable: [],
    };
    const mockFight = { start: 1000 };

    // Initialize a new threat trace
    const startTime = 1500;
    const trace = new ThreatTrace(mockUnit, startTime, mockFight);

    // Verify initial state
    expect(trace.threat).toEqual([0]);
    expect(trace.time).toEqual([startTime]);
    expect(trace.text).toEqual(["Joined fight"]);
    expect(trace.coeff[0].value).toBe(1.5); // From mockUnit.threatCoeff()
    expect(trace.borderWidth).toEqual([0]); // From mockUnit.border
    expect(trace.borderColor).toEqual([null]); // From mockUnit.border
    expect(trace.currentThreat).toBe(0);
    expect(trace.fixateHistory).toEqual([null]);
    expect(trace.invulnerabilityHistory).toEqual([[]]);
  });

  test("setThreat updates threat level with correct tracking", () => {
    // Create mock unit and fight
    const mockUnit = {
      key: "target1",
      threatCoeff: () => ({ value: 1.0, debug: [] }),
      border: [0, null],
      invulnerable: [],
    };
    const mockFight = { start: 1000 };

    // Initialize a new threat trace
    const startTime = 1500;
    const trace = new ThreatTrace(mockUnit, startTime, mockFight);

    // Set threat values and verify they're tracked correctly
    trace.setThreat(100, 1600, "Initial threat");

    expect(trace.threat).toEqual([0, 100]);
    expect(trace.time).toEqual([1500, 1600]);
    expect(trace.text).toEqual(["Joined fight", "Initial threat"]);
    expect(trace.currentThreat).toBe(100);

    // Set another threat value
    trace.setThreat(250, 1700, "More threat");

    expect(trace.threat).toEqual([0, 100, 250]);
    expect(trace.time).toEqual([1500, 1600, 1700]);
    expect(trace.text).toEqual([
      "Joined fight",
      "Initial threat",
      "More threat",
    ]);
    expect(trace.currentThreat).toBe(250);

    // Verify that setting the same threat still records the event
    trace.setThreat(250, 1800, "Same threat");

    expect(trace.threat).toEqual([0, 100, 250, 250]);
    expect(trace.currentThreat).toBe(250);
  });

  test("addThreat correctly increments current threat", () => {
    // Create mock unit and fight
    const mockUnit = {
      key: "target1",
      threatCoeff: () => ({ value: 1.0, debug: [] }),
      border: [0, null],
      invulnerable: [],
    };
    const mockFight = { start: 1000 };

    // Initialize a new threat trace
    const startTime = 1500;
    const trace = new ThreatTrace(mockUnit, startTime, mockFight);

    // Add threat and verify it's added correctly
    trace.addThreat(100, 1600, "Initial threat", { value: 1.5, debug: [] });

    expect(trace.currentThreat).toBe(150); // 100 * 1.5

    // Add more threat
    trace.addThreat(50, 1700, "More threat", { value: 2.0, debug: [] });

    expect(trace.currentThreat).toBe(250); // 150 + (50 * 2.0)

    // Add threat with bonus
    trace.addThreat(
      50,
      1800,
      "Threat with bonus",
      { value: 1.0, debug: [] },
      30
    );

    expect(trace.currentThreat).toBe(330); // 250 + (50 * 1.0) + 30
  });

  test("addMark adds a visual marker without changing threat", () => {
    // Create mock unit and fight
    const mockUnit = {
      key: "target1",
      threatCoeff: () => ({ value: 1.0, debug: [] }),
      border: [0, null],
      invulnerable: [],
    };
    const mockFight = { start: 1000 };

    // Initialize a new threat trace with some threat
    const startTime = 1500;
    const trace = new ThreatTrace(mockUnit, startTime, mockFight);
    trace.setThreat(100, 1600, "Initial threat");

    // Add a mark with a custom border
    const border = [2, "#ff0000"];
    trace.addMark(1700, "Important event", border);

    // Verify the threat didn't change but the mark was added
    expect(trace.currentThreat).toBe(100); // Unchanged
    expect(trace.threat).toEqual([0, 100, 100]); // Threat unchanged at mark point
    expect(trace.time).toEqual([1500, 1600, 1700]);
    expect(trace.text).toEqual([
      "Joined fight",
      "Initial threat",
      "Important event",
    ]);
    expect(trace.borderWidth[2]).toBe(2); // Custom border width
    expect(trace.borderColor[2]).toBe("#ff0000"); // Custom border color
  });

  test("tracks invulnerability changes", () => {
    // Create mock unit with changing invulnerability
    const mockUnit = {
      key: "target1",
      threatCoeff: () => ({ value: 1.0, debug: [] }),
      border: [0, null],
      invulnerable: [],
    };
    const mockFight = { start: 1000 };

    // Initialize a new threat trace
    const startTime = 1500;
    const trace = new ThreatTrace(mockUnit, startTime, mockFight);

    // Set some initial threat
    trace.setThreat(100, 1600, "Initial threat");

    // Now the target becomes invulnerable
    mockUnit.invulnerable = ["IceBlock"];
    mockUnit.border = [2, "#0f0"]; // Green border for invulnerable

    // Add more threat
    trace.setThreat(150, 1700, "While invulnerable");

    // Verify invulnerability was tracked
    expect(trace.invulnerabilityHistory).toEqual([[], [], ["IceBlock"]]);
    expect(trace.borderWidth[2]).toBe(2);
    expect(trace.borderColor[2]).toBe("#0f0");

    // Target is no longer invulnerable
    mockUnit.invulnerable = [];
    mockUnit.border = [0, null];

    // Add more threat
    trace.setThreat(200, 1800, "No longer invulnerable");

    // Verify invulnerability tracking was updated
    expect(trace.invulnerabilityHistory).toEqual([[], [], ["IceBlock"], []]);
    expect(trace.borderWidth[3]).toBe(0);
    expect(trace.borderColor[3]).toBe(null);
  });

  test("threatBySkill correctly summarizes threat by ability", () => {
    // Create mock unit and fight
    const mockUnit = {
      key: "target1",
      threatCoeff: () => ({ value: 1.0, debug: [] }),
      border: [0, null],
      invulnerable: [],
    };
    const mockFight = { start: 0 };

    // Initialize a new threat trace
    const startTime = 1500;
    const trace = new ThreatTrace(mockUnit, startTime, mockFight);

    // Add threat from different abilities
    trace.setThreat(100, 2000, "Fireball");
    trace.setThreat(250, 3000, "Frostbolt");
    trace.setThreat(400, 4000, "Fireball");
    trace.setThreat(500, 5000, "Arcane Missiles");

    // Get threat summary
    const threatSummary = trace.threatBySkill();

    // Verify the summary is correct
    expect(threatSummary).toEqual({
      Fireball: 250, // 100 initially + additional 150 (400-250) later
      Frostbolt: 150, // 250 - 100
      "Arcane Missiles": 100, // 500 - 400
    });

    // Test with time range filter
    const filteredSummary = trace.threatBySkill([3.0, 4.0]);

    // Should only include Frostbolt and Fireball (second instance)
    expect(filteredSummary).toEqual({
      Fireball: 150,
      Frostbolt: 150,
    });
  });
});
