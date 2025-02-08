const shaman = (function () {
  const config = {
    Buff: {
      TranquilAirTotem: 25909,
    },
  };

  const initialBuffs = {};

  const buffNames = {
    [config.Buff.TranquilAirTotem]: "Tranquil Air Totem",
  };

  const buffMultipliers = {
    [config.Buff.TranquilAirTotem]: getThreatCoefficient(0.8), // Tranquil Air Totem Aura
  };

  const HEALING_SPELLS = {
    8004: true,
    8008: true,
    8010: true,
    10466: true,
    10467: true,
    10468: true, // Lesser Healing Wave
    331: true,
    332: true,
    547: true,
    913: true,
    939: true,
    959: true,
    8005: true,
    10395: true,
    10396: true,
    25357: true, // Healing Wave
    1064: true,
    10622: true,
    10623: true, // Chain Heal
  };

  const talents = {
    "Healing Grace": {
      maxRank: 3,
      coeff: (_, rank = 3, spellId) =>
        getThreatCoefficient(1 - 0.05 * rank * (spellId in HEALING_SPELLS)),
    },
  };

  const fixateBuffs = {};

  const spellFunctions = {
    8042: handler_modDamage(2), // Earth Shock r1
    8044: handler_modDamage(2), // Earth Shock r2
    8045: handler_modDamage(2), // Earth Shock r3
    8046: handler_modDamage(2), // Earth Shock r4
    10412: handler_modDamage(2), // Earth Shock r5
    10413: handler_modDamage(2), // Earth Shock r6
    10414: handler_modDamage(2), // Earth Shock r7
  };

  const combatantImplications = (unit, buffs, talents) => {};

  const notableBuffs = {
    ...Object.values(config.Buff),
  };

  const invulnerabilityBuffs = {};

  const auraImplications = {};

  return {
    buffMultipliers,
    combatantImplications,
    config,
    initialBuffs,
    spellFunctions,
    talents,
    notableBuffs,
    buffNames,
    fixateBuffs,
    invulnerabilityBuffs,
    auraImplications,
  };
})();
