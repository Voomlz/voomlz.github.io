const shaman = (function () {
  const config = {
    Mods: {
      MoltenBlast: 2.0,
      EarthShock: 2.0,
      SpiritOfTheAlpha: 1.45,

      /**
       * While Rockbiter Weapon is active on your main hand weapon and you have a shield equipped,
       * you deal 65% increased threat
       */
      WayOfEarth: 1.65,

      LoyalBeta: 0.7,
    },
    Buff: {
      TranquilAirTotem: 25909,
      SpiritOfTheAlpha: 408696,
      LoyalBeta: 443320,
    },
    Spell: {
      MoltenBlast: 425339,
    },
  };

  const initialBuffs = {
    [config.Buff.SpiritOfTheAlpha]: 0,
    [config.Buff.WayOfEarth]: 0,
  };

  const buffNames = {
    [config.Buff.TranquilAirTotem]: "Tranquil Air Totem",
    [config.Buff.SpiritOfTheAlpha]: "Spirit of the Alpha",
    [config.Buff.LoyalBeta]: "Loyal Beta",
    [config.Buff.WayOfEarth]: "Way of Earth",
  };

  const buffMultipliers = {
    [config.Buff.TranquilAirTotem]: getThreatCoefficient(0.8), // Tranquil Air Totem Aura
    [config.Buff.SpiritOfTheAlpha]: getThreatCoefficient(
      config.Mods.SpiritOfTheAlpha
    ),
    [config.Buff.LoyalBeta]: getThreatCoefficient(config.Mods.LoyalBeta),

    // TODO: only when rockbiter weapon is active on MH
    // [config.Buff.WayOfEarth]: getThreatCoefficient(config.Mods.WayOfEarth),
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
    8042: handler_modDamage(config.Mods.EarthShock), // Earth Shock r1
    8044: handler_modDamage(config.Mods.EarthShock), // Earth Shock r2
    8045: handler_modDamage(config.Mods.EarthShock), // Earth Shock r3
    8046: handler_modDamage(config.Mods.EarthShock), // Earth Shock r4
    10412: handler_modDamage(config.Mods.EarthShock), // Earth Shock r5
    10413: handler_modDamage(config.Mods.EarthShock), // Earth Shock r6
    10414: handler_modDamage(config.Mods.EarthShock), // Earth Shock r7

    [config.Spell.MoltenBlast]: handler_modDamage(config.Mods.MoltenBlast),
  };

  const combatantImplications = (unit, buffs, talents) => {};

  const notableBuffs = {
    ...Object.values(config.Buff),
  };

  const invulnerabilityBuffs = {};

  const auraImplications = {
    [config.Spell.MoltenBlast]: config.Buff.SpiritOfTheAlpha,
  };

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
