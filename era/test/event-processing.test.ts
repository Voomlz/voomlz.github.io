import { expect, test, describe, vi } from "vitest";
import {
  applyThreatCoefficient,
  BASE_COEFFICIENT,
  handler_basic,
  handler_taunt,
} from "../base.js";

describe("Event Processing", () => {
  describe("handler_basic", () => {
    test("processes damage events correctly", () => {
      // Mock the necessary objects and functions
      const mockSource = {
        key: "player1",
        threatCoeff: vi.fn(() => ({ value: 1.0, debug: [] })),
      };
      const mockTarget = {
        key: "boss1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };

      // Create a damage event
      const damageEvent = {
        type: "damage",
        amount: 200,
        absorbed: 50,
        timestamp: 1000,
        ability: { name: "Fireball", guid: 123 },
      };

      // Process the event
      handler_basic(damageEvent, mockFight);

      // Verify the target received threat
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "player1",
        250,
        1000,
        "Fireball",
        expect.objectContaining({ value: 1.0 }),
        0 // bonusThreat
      );
    });

    test("processes heal events with 0.5 threat coefficient split among enemies", () => {
      // Mock required objects
      const mockSource = {
        key: "player1",
        threatCoeff: vi.fn(() => ({ value: 1.0, debug: [] })),
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
          {}, // Empty friendlies
          mockEnemies, // Enemies
        ]),
      };

      // Create a heal event
      const healEvent = {
        type: "heal",
        amount: 300,
        timestamp: 1000,
        ability: { name: "Healing Touch", guid: 456 },
        sourceIsFriendly: true,
        targetIsFriendly: true,
      };

      // Process the event
      handler_basic(healEvent, mockFight);

      // Check each enemy received the correct threat
      // Heal threat should be amount * 0.5, then split between enemies
      for (const enemy of Object.values(mockEnemies)) {
        expect(enemy.addThreat).toHaveBeenCalledTimes(1);
        expect(enemy.addThreat).toHaveBeenCalledWith(
          "player1",
          300,
          1000,
          "Healing Touch",
          // Coefficient should be 0.5 (heal mod) * 0.5 (split) = 0.25
          expect.objectContaining({ value: 0.5 * 0.5 })
        );
      }
    });

    // TODO: re-enable when it works. Should add threat to enemies, but is filtered only for debuffs
    // friendly to friendly???
    test.skip("processes applydebuff events correctly", () => {
      // Mock required objects
      const mockSource = {
        key: "player1",
        threatCoeff: vi.fn(() => ({ value: 1.0, debug: [] })),
      };
      const mockTarget = {
        key: "boss1",
        addThreat: vi.fn(),
      };
      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };

      // Create a debuff event
      const debuffEvent = {
        type: "applydebuff",
        timestamp: 1000,
        ability: { name: "Curse of Elements", guid: 789 },
        sourceIsFriendly: true,
        targetIsFriendly: false,
      };

      // Process the event
      handler_basic(debuffEvent, mockFight);

      // Verify threat was generated (120 is the default debuff threat)
      expect(mockTarget.addThreat).toHaveBeenCalledTimes(1);
      expect(mockTarget.addThreat).toHaveBeenCalledWith(
        "player1",
        120,
        1000,
        "Curse of Elements",
        expect.objectContaining({ value: 1.0 })
      );
    });

    test("splits {apply|refreshbuff} threat between (alive) enemies", () => {
      // Mock required objects
      const mockSource = {
        key: "player1",
        threatCoeff: vi.fn(() => ({ value: 1.0, debug: [] })),
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
        deadEnemy: {
          key: "deadEnemy",
          alive: false,
          addThreat: vi.fn(),
        },
      };

      const mockFight = {
        eventToUnit: vi.fn(() => mockSource),
        eventToFriendliesAndEnemies: vi.fn(() => [
          {}, // Empty friendlies
          mockEnemies, // Enemies
        ]),
      };

      // Create a buff event
      const buffEvent = {
        type: "applybuff",
        timestamp: 1000,
        ability: { name: "Arcane Intellect", guid: 1459 },
        sourceIsFriendly: true,
        targetIsFriendly: true,
      };

      // Process the event
      handler_basic(buffEvent, mockFight);

      let coeffHalf = applyThreatCoefficient(
        BASE_COEFFICIENT,
        1.0,
        "Arcane Intellect"
      );

      coeffHalf = applyThreatCoefficient(
        coeffHalf,
        0.5,
        "split between 2 enemies"
      );

      // Verify threat was generated (60 is the default buff threat)
      const { enemy1, enemy2, deadEnemy } = mockEnemies;
      expect(enemy1.addThreat).toHaveBeenCalled();
      expect(enemy1.addThreat).toHaveBeenCalledWith(
        "player1",
        60,
        1000,
        "Arcane Intellect",
        coeffHalf
      );

      expect(enemy2.addThreat).toHaveBeenCalled();
      expect(enemy2.addThreat).toHaveBeenCalledWith(
        "player1",
        60,
        1000,
        "Arcane Intellect",
        coeffHalf
      );

      expect(deadEnemy.addThreat).not.toHaveBeenCalled();
    });
  });

  describe("handler_taunt", () => {
    test("transfers maximum threat to the taunting player", () => {
      // Mock necessary objects
      const mockSource = { key: "player1" };
      const mockTarget = {
        key: "boss1",
        threat: {
          player1: { currentThreat: 500 },
          player2: { currentThreat: 1000 },
          player3: { currentThreat: 800 },
        },
        setThreat: vi.fn(),
        target: null,
      };

      const mockFight = {
        eventToUnit: vi.fn((ev, type) => {
          if (type === "source") return mockSource;
          if (type === "target") return mockTarget;
          return null;
        }),
      };

      // Create a taunt event
      const tauntEvent = {
        type: "applydebuff",
        timestamp: 2000,
        ability: { name: "Taunt", guid: 355 },
      };

      // Process the taunt
      handler_taunt(tauntEvent, mockFight);

      // Verify the target's threat was set to the maximum threat (1000)
      expect(mockTarget.setThreat).toHaveBeenCalledWith(
        "player1", // source key
        1000, // max threat value
        2000, // timestamp
        "Taunt" // ability name
      );

      // Verify the target was set to the taunting player
      expect(mockTarget.target).toBe(mockSource);
    });
  });
});
