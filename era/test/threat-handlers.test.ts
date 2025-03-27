import { test, expect, describe, vi } from "vitest";
import {
  threatFunctions,
  handler_modDamage,
  handler_modHeal,
  handler_modDamagePlusThreat,
  handler_threatOnHit,
} from "../base.js";

describe("Threat Handlers", () => {
  describe("sourceThreatenTarget", () => {
    test("applies threat with source coefficient by default", () => {
      // Mock the necessary objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockTarget = {
        key: "target1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Test Ability", guid: 123 },
      };

      // Call the function
      threatFunctions.sourceThreatenTarget({
        ev: mockEvent,
        fight: mockFight,
        amount: 100,
      });

      // Verify addThreat was called on the target with correct parameters
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "source1",
        100,
        1000,
        "Test Ability",
        expect.objectContaining({ value: 1.5 }),
        0
      );
    });

    test("applies threat without source coefficient when useThreatCoeffs is false", () => {
      // Mock the necessary objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockTarget = {
        key: "target1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Test Ability", guid: 123 },
      };

      // Call the function
      threatFunctions.sourceThreatenTarget({
        ev: mockEvent,
        fight: mockFight,
        amount: 100,
        useThreatCoeffs: false,
      });

      // Verify addThreat was called on the target with correct parameters
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "source1",
        100,
        1000,
        "Test Ability",
        expect.objectContaining({ value: 1.0 }),
        0
      );
    });

    test("combines source and ability coefficients", () => {
      // Mock the necessary objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({
          value: 1.5,
          debug: [{ value: 1.5, label: "Class mod" }],
        })),
      };
      const mockTarget = {
        key: "target1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Test Ability", guid: 123 },
      };

      // Call the function
      threatFunctions.sourceThreatenTarget({
        ev: mockEvent,
        fight: mockFight,
        amount: 100,
        multiplier: 2.0,
      });

      // Verify addThreat was called on the target with correct parameters
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "source1",
        100,
        1000,
        "Test Ability",
        expect.objectContaining({
          value: 3.0,
          debug: expect.arrayContaining([
            expect.objectContaining({ value: 1.5 }),
            expect.objectContaining({ value: 2.0 }),
          ]),
        }),
        0
      );
    });

    test("handles mod + bonus threat correctly", () => {
      // Mock objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockTarget = {
        key: "target1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Sunder Armor", guid: 123 },
      };

      // Call with bonus threat
      threatFunctions.sourceThreatenTarget({
        ev: mockEvent,
        fight: mockFight,
        amount: 100,
        multiplier: 1.5,
        bonusThreat: 200,
      });

      // Verify correct bonus threat calculation
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "source1",
        100,
        1000,
        "Sunder Armor",
        expect.objectContaining({ value: 1.5 * 1.5 }),
        1.5 * 200
      );
    });

    test("includes bonus threat in debug info", () => {
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockTarget = {
        key: "target1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Test Ability", guid: 123 },
      };

      // Call the function
      threatFunctions.sourceThreatenTarget({
        ev: mockEvent,
        fight: mockFight,
        amount: 100,
        bonusThreat: 200,
      });

      // Verify addThreat was called on the target with correct parameters
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "source1",
        100,
        1000,
        "Test Ability",
        expect.objectContaining({
          value: 1.5,
          debug: expect.arrayContaining([
            expect.objectContaining({}),
            expect.objectContaining({ value: 1.0, bonus: 200 }),
          ]),
        }),
        200 * 1.5
      );
    });
  });

  describe("unitThreatenEnemiesSplit", () => {
    test("splits threat among enemies", () => {
      // Mock objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockEnemies = {
        enemy1: {
          key: "enemy1",
          alive: true,
          addThreat: vi.fn(),
        },
        enemy2: {
          key: "enemy2",
          alive: true,
          addThreat: vi.fn(),
        },
      };
      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        eventToFriendliesAndEnemies: vi.fn(() => [
          {}, // Friendlies (empty)
          mockEnemies, // Enemies
        ]),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Healing Spell", guid: 123 },
      };

      // Call the function
      threatFunctions.unitThreatenEnemiesSplit({
        ev: mockEvent,
        unit: "source",
        fight: mockFight,
        amount: 200,
        multiplier: 0.5,
      });

      // Check that each enemy got half the threat
      for (const enemy of Object.values(mockEnemies)) {
        expect(enemy.addThreat).toHaveBeenCalledTimes(1);
        expect(enemy.addThreat).toHaveBeenCalledWith(
          "source1",
          200,
          1000,
          "Healing Spell",
          expect.objectContaining({ value: 1.5 * 0.5 * 0.5 })
        );
      }
    });

    test("only applies split and threat to alive enemies", () => {
      // Mock objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockEnemies = {
        enemy1: {
          key: "enemy1",
          alive: true,
          addThreat: vi.fn(),
        },
        deadEnemy: {
          key: "deadEnemy",
          alive: false,
          addThreat: vi.fn(),
        },
      };
      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        eventToFriendliesAndEnemies: vi.fn(() => [
          {}, // Friendlies (empty)
          mockEnemies, // Enemies
        ]),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Healing Spell", guid: 123 },
      };

      // Call the function
      threatFunctions.unitThreatenEnemiesSplit({
        ev: mockEvent,
        unit: "source",
        fight: mockFight,
        amount: 200,
      });

      // Check that each enemy got half the threat
      expect(mockEnemies.enemy1.addThreat).toHaveBeenCalledTimes(1);
      expect(mockEnemies.enemy1.addThreat).toHaveBeenCalledWith(
        "source1",
        200,
        1000,
        "Healing Spell",
        expect.objectContaining({ value: 1.5 })
      );

      expect(mockEnemies.deadEnemy.addThreat).not.toHaveBeenCalled();
    });

    test("does not pass through source coefficient if useThreatCoeffs is false", () => {
      // Mock objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockEnemies = {
        enemy1: {
          key: "enemy1",
          alive: true,
          addThreat: vi.fn(),
        },
        enemy2: {
          key: "enemy2",
          alive: true,
          addThreat: vi.fn(),
        },
      };
      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        eventToFriendliesAndEnemies: vi.fn(() => [
          {}, // Friendlies (empty)
          mockEnemies, // Enemies
        ]),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Healing Spell", guid: 123 },
      };

      // Call the function
      threatFunctions.unitThreatenEnemiesSplit({
        ev: mockEvent,
        unit: "source",
        fight: mockFight,
        amount: 200,
        useThreatCoeffs: false,
      });

      /// Check that each enemy got half the threat
      for (const enemy of Object.values(mockEnemies)) {
        expect(enemy.addThreat).toHaveBeenCalledTimes(1);
        expect(enemy.addThreat).toHaveBeenCalledWith(
          "source1",
          200,
          1000,
          "Healing Spell",
          expect.objectContaining({ value: 0.5 })
        );
      }
    });

    test("does not pass through source coefficient if useThreatCoeffs is false", () => {
      // Mock objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockEnemies = {
        enemy1: {
          key: "enemy1",
          alive: true,
          addThreat: vi.fn(),
        },
        enemy2: {
          key: "enemy2",
          alive: true,
          addThreat: vi.fn(),
        },
      };
      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        eventToFriendliesAndEnemies: vi.fn(() => [
          {}, // Friendlies (empty)
          mockEnemies, // Enemies
        ]),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Healing Spell", guid: 123 },
      };

      // Call the function
      threatFunctions.unitThreatenEnemiesSplit({
        ev: mockEvent,
        unit: "source",
        fight: mockFight,
        amount: 200,
        useThreatCoeffs: false,
      });

      /// Check that each enemy got half the threat
      for (const enemy of Object.values(mockEnemies)) {
        expect(enemy.addThreat).toHaveBeenCalledTimes(1);
        expect(enemy.addThreat).toHaveBeenCalledWith(
          "source1",
          200,
          1000,
          "Healing Spell",
          expect.objectContaining({ value: 0.5 })
        );
      }
    });

    test("applies the optional multiplier as a coefficient", () => {
      // Mock objects
      const mockSource = {
        key: "source1",
        threatCoeff: vi.fn(() => ({ value: 1.5, debug: [] })),
      };
      const mockEnemies = {
        enemy1: {
          key: "enemy1",
          alive: true,
          addThreat: vi.fn(),
        },
        enemy2: {
          key: "enemy2",
          alive: true,
          addThreat: vi.fn(),
        },
      };
      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        eventToFriendliesAndEnemies: vi.fn(() => [
          {}, // Friendlies (empty)
          mockEnemies, // Enemies
        ]),
      };
      const mockEvent = {
        timestamp: 1000,
        ability: { name: "Healing Spell", guid: 123 },
      };

      // Call the function
      threatFunctions.unitThreatenEnemiesSplit({
        ev: mockEvent,
        unit: "source",
        fight: mockFight,
        amount: 200,
        multiplier: 2,
        useThreatCoeffs: false,
      });

      /// Check that each enemy got half the threat
      for (const enemy of Object.values(mockEnemies)) {
        expect(enemy.addThreat).toHaveBeenCalledTimes(1);
        expect(enemy.addThreat).toHaveBeenCalledWith(
          "source1",
          200,
          1000,
          "Healing Spell",
          expect.objectContaining({ value: 0.5 * 2.0 })
        );
      }
    });
  });

  describe("Threat modifiers", () => {
    test("handler_modDamage applies correct threat multiplier", () => {
      const mockSource = { key: "source1" };
      const mockTarget = { key: "target1" };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
        }),
        sourceThreatenTarget: vi.fn(),
      };

      // Create a mock for threatFunctions.sourceThreatenTarget
      const originalSourceThreatenTarget = threatFunctions.sourceThreatenTarget;
      threatFunctions.sourceThreatenTarget = vi.fn();

      try {
        const damageHandler = handler_modDamage(2.0);
        const mockEvent = {
          type: "damage",
          amount: 100,
          absorbed: 20,
          ability: { name: "Test Ability" },
        };

        damageHandler(mockEvent, mockFight);

        expect(threatFunctions.sourceThreatenTarget).toHaveBeenCalledWith({
          ev: mockEvent,
          fight: mockFight,
          amount: 120, // 100 + 20 absorbed
          multiplier: 2.0,
        });
      } finally {
        // Restore the original function
        threatFunctions.sourceThreatenTarget = originalSourceThreatenTarget;
      }
    });

    test("handler_modHeal applies correct threat multiplier", () => {
      const mockSource = { key: "source1" };
      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        unitThreatenEnemiesSplit: vi.fn(),
      };

      // Create a mock for threatFunctions.unitThreatenEnemiesSplit
      const originalUnitThreatenEnemiesSplit =
        threatFunctions.unitThreatenEnemiesSplit;
      threatFunctions.unitThreatenEnemiesSplit = vi.fn();

      try {
        const healHandler = handler_modHeal(2.0);
        const mockEvent = {
          type: "heal",
          amount: 100,
          ability: { name: "Test Heal" },
        };

        healHandler(mockEvent, mockFight);

        expect(threatFunctions.unitThreatenEnemiesSplit).toHaveBeenCalledWith({
          ev: mockEvent,
          unit: "source",
          fight: mockFight,
          amount: 100,
          multiplier: 1.0, // 2.0 * 0.5
          debugLabel: "modHeal (2 * 0.5)",
        });
      } finally {
        // Restore the original function
        threatFunctions.unitThreatenEnemiesSplit =
          originalUnitThreatenEnemiesSplit;
      }
    });

    test("handler_modDamagePlusThreat handles both multiplier and bonus threat", () => {
      const mockFight = {};

      // Create a mock for threatFunctions.sourceThreatenTarget
      const originalSourceThreatenTarget = threatFunctions.sourceThreatenTarget;
      threatFunctions.sourceThreatenTarget = vi.fn();

      try {
        const handler = handler_modDamagePlusThreat(1.5, 100);
        const mockEvent = {
          type: "damage",
          amount: 200,
          absorbed: 0,
          hitType: 1, // Normal hit
          ability: { name: "Test Ability" },
        };

        handler(mockEvent, mockFight);

        expect(threatFunctions.sourceThreatenTarget).toHaveBeenCalledWith({
          ev: mockEvent,
          fight: mockFight,
          amount: 200,
          multiplier: 1.5,
          bonusThreat: 100,
        });
      } finally {
        // Restore the original function
        threatFunctions.sourceThreatenTarget = originalSourceThreatenTarget;
      }
    });

    test("handler_threatOnHit adds bonus threat on successful hits", () => {
      const mockFight = {};

      // Create a mock for threatFunctions.sourceThreatenTarget
      const originalSourceThreatenTarget = threatFunctions.sourceThreatenTarget;
      threatFunctions.sourceThreatenTarget = vi.fn();

      try {
        const handler = handler_threatOnHit(300);
        const mockEvent = {
          type: "damage",
          amount: 150,
          absorbed: 0,
          hitType: 1, // Normal hit (not a miss)
          ability: { name: "Test Ability" },
        };

        handler(mockEvent, mockFight);

        expect(threatFunctions.sourceThreatenTarget).toHaveBeenCalledWith({
          ev: mockEvent,
          fight: mockFight,
          amount: 150,
          bonusThreat: 300,
        });
      } finally {
        // Restore the original function
        threatFunctions.sourceThreatenTarget = originalSourceThreatenTarget;
      }
    });
  });
});
