//@ts-check

const mage = (function () {
  const config = {
    Buff: {
      IceBlock: 11958,
    },
    Mods: {},
    Spell: {},
  };

  const initialBuffs = {};

  const buffNames = {};

  const buffMultipliers = {};

  const talents = {
    "Arcane Subtlety": {
      maxRank: 2,
      coeff: (_, rank = 2) =>
        getThreatCoefficient({ [School.Arcane]: 1 - 0.2 * rank }),
    },
    "Burning Soul": {
      maxRank: 2,
      coeff: (_, rank = 2) =>
        getThreatCoefficient({ [School.Fire]: 1 - 0.15 * rank }),
    },
    "Frost Channeling": {
      maxRank: 3,
      coeff: (_, rank = 3) =>
        getThreatCoefficient({ [School.Frost]: 1 - 0.1 * rank }),
    },
    "Burning Soul ForstFire": {
      maxRank: 2,
      coeff: (_, rank = 2, spellId) =>
          getThreatCoefficient(1 - 0.15 * rank * (spellId in { 401502:true }))
    },
    "Frost Channeling ForstFire": {
      maxRank: 3,
      coeff: (_, rank = 3, spellId) =>
        getThreatCoefficient(1 - 0.1 * rank * (spellId in { 401502:true }))
    },
  };

  const fixateBuffs = {};

  const spellFunctions = {
    10181: handler_damage, // Frostbolt
  };

  const combatantImplications = (unit, buffs, talents) => {};

  const notableBuffs = {
    ...Object.values(config.Buff),
  };

  const invulnerabilityBuffs = {
    [config.Buff.IceBlock]: "Ice Block",
  };

  const auraImplications = {};

  const aggroLossBuffs = {
    118: true,
    12824: true,
    12825: true,
    28272: true,
    28271: true,
    12826: true, // Polymorph
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
    aggroLossBuffs,
  };
})();
