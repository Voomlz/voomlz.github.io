let DEBUGMODE = false;

let borders = {
	taunt: [3, "#ffa500"],
}

const School = {
	Physical: 1,
	Holy: 2,
	Fire: 4,
	Nature: 8,
	Frost: 16,
	Shadow: 32,
	Arcane: 64, 
}


function getThreatCoefficient(values) {
	if (typeof values === "number") {
		values = {0: values};
	}
	if (!(0 in values)) values[0] = 1;
	return function(spellSchool = 0) {
		if (spellSchool in values) return values[spellSchool];
		return values[0];
	}
}

/** 
 * Adds an additive threat coefficient on top of another, since the coefficients are usually multiplied.
 * 
 * This should be just the additive part i.e. 0.15 and not the multiplicative coefficient of 1.15
 */
function getAdditiveThreatCoefficient(value, base) {
  return getThreatCoefficient((base + value) / base)
}

const preferredSpellSchools = {
	Mage: School.Frost,
	Priest: School.Holy,
	Paladin: School.Holy,
	Warlock: School.Shadow,
	// Others will be defaulted to 1 = physical
};

const Warrior = {
  Stance: {
    Defensive: 71,
    Battle: 2457,
    Berserker: 2458,
    Gladiator: 412513,
  },
  Mods: {
    DefensiveStance: 1.3,
    Defiance: 0.03, // 3% per point up to 15%
    OtherStances: 0.80,
    GladiatorStance: 0.70,
    /** Base shield slam mod */
    ShieldSlam: 2.0,
    /** Base Revenge mod */
    Revenge: 2.25,
    /** 1.20 in defensive stance */
    T1_Tank_6pc: 1.20,
    /** 2.0x to Shield Slam */
    TAQ_Tank_4pc: 2.0,
    /** 1.5x to Thunder Clap with the rune */
    FuriousThunder: 1.5,
    /** 1.5x to Devastate only when in Def stance */
    RuneOfDevastate: 1.5,
  },
  Spell: {
    Devastate: 20243, // Original
    DevastateSoD: 403196, // SoD version
    ShieldSlamR1: 23922,
    ShieldSlamR2: 23923,
    ShieldSlamR3: 23924,
    ShieldSlamR4: 23925,
    ThunderClapR1: 6343,
		ThunderClapR2: 8198,
		ThunderClapR3: 8204,
		ThunderClapR4: 8205,
		ThunderClapR5: 11580,
		ThunderClapR6: 11581,
  },
  Tier: {
    T1_Tank: {
      Helm: 226488,
      Shoulders: 226491,
      Chest: 226489,
      Legs: 226490,
      Feet: 226487,
      Bracers: 226484,
      Belt: 226485,
      Hands: 226486,
    },
    T2_Tank_CoreForged: {
      Helm: 232259,
      // TODO
    },
    TAQ_Tank: {
      Helm: 233375,
      Shoulders: 233376,
      Chest: 233373,
      Legs: 233374,
      Feet: 233372,
    },
  },
  Buff: {
    T1_Tank_6pc: 457651,
    TAQ_Tank_4pc: 1214162,
    RuneOfDevastate: 403195,
  },
}

const Paladin = {
  /**
   * From the Light Club disc:
   * - Hand of Reckoning applies a 1.5 baseline tank threat multiplier to all threat
   * - Non holy threat is multiplied by 1.5
   * - Holy threat without imp. RF with HoR is 2.23
   * - Holy threat with imp. RF and HoR is 2.85
   */
  Mods: {
    PhysicalBase: 1.5,  // Physical damage coefficient for Tank Rune
    HolyWithImpRF: 2.85, // Holy damage coefficient with Improved Righteous Fury
    HolyWithoutImpRF: 2.23, // Holy damage coefficient without Improved Righteous Fury
    OldValues: {
      NonHoly: 1.0, // Old non-Holy value
      HolyRFNonImp: 1.6, // Old Holy value without Imp RF
      HolyImpRF: 1.9 // Old Holy value with Imp RF
    },
    Salvation: 0.7,
  },
  Buff: {
    Salv: 1038,
    GreaterSalv: 25895,
    RighteousFury: 25780,
  }
}

const Rogue = {
  Mods: {
    Base: 0.71,
    JustAFleshWound: 1.855, // taken from compendium
    MainGauche: 1.51,
    T1_Tank_2pc: 2.0,
    UnfairAdvantage: 1.50,
  },
  Spell: {
    Blunderbuss: 436564,
    CrimsonTempest: 412096,
    FanOfKnives: 409240,
    PoisonedKnife: 425012,
    SinisterStrikeR7: 11293,
    SinisterStrikeR8: 11294,
    Tease: 410412,
    UnfairAdvantage: 432274,
    MainGauche: 424919,
  },
  Buff: {
    JustAFleshWound: 400014,
    MainGauche: 462752,
    BladeDance: 400012,
    T1_Tank_2pc: 457349,
  },
};

const Druid = {
  Form: {
    Bear: 5487,
    DireBear: 9634,
    Cat: 768,
    Tree: 439733,
    Moonkin: 24858,
  },
  Mods: {
    Cat: 0.71,
    DireBear: 1.3,
    FeralInstinct: 0.03,
    Lacerate: 3.5,
    Swipe: 3.5,
    T1_Tank_6pc: 0.20
  },
  Buff: {
    T1_Tank_6pc: 456332,
  },
  Spell: {
    Starsurge: 417157,
    Starfall: 439753,
    WildGrowth: 408120,
    Lifebloom: 408124,
    LifebloomTick: 408245,
    Nourish: 408247,
    LivingSeed: 414683,
  },
};

const Hunter = {
  Buff: {
    T1_Ranged_2pc: 456339, // Ferocity
  },
  Mods: {
    T1_Ranged_2pc: 2.0,
  },
  Spell: {
    FeignDeath: 5384,
    DistractingShotR1: 20736,
    DistractingShotR2: 14274,
    DistractingShotR3: 15629,
    DistractingShotR4: 15630,
    DistractingShotR5: 15631,
    DistractingShotR6: 15632,
    DisengageR1: 781,
    DisengageR2: 14272,
    DisengageR3: 14273,
  },
};

const Items = {
  Enchant: {
    GlovesThreat: 25072,
    CloakSubtlety: 25084,
  },
  Mods: {
    GlovesThreat: 1.02,
    CloakSubtlety: 1 - 0.02,
  }
}

const baseThreatCoefficients = {
	Rogue:   getThreatCoefficient(Rogue.Mods.Base),
	// Others will be defaulted to 1
}

/** Sets certain buffs to always show as toggles per class */
const initialBuffs = {
  All: {
    [Paladin.Buff.Salv]: 0, 
    [Paladin.Buff.GreaterSalv]: 0, 
    25909: 0
  },
  Paladin: {
    [Paladin.Buff.RighteousFury]: 0,
  },
  Warrior: {
    [Warrior.Stance.Defensive]: 0,		// Stances
    [Warrior.Stance.Battle]: 0,
    [Warrior.Stance.Berserker]: 0,
    [Warrior.Stance.Gladiator]: 0,
    [Warrior.Buff.T1_Tank_6pc]: 3, // inferred off
    [Warrior.Buff.TAQ_Tank_4pc]: 3, // inferred off
    [Warrior.Buff.RuneOfDevastate]: 0,
  },
  Druid: {
    [Druid.Form.Bear]: 0,	// Forms
    [Druid.Form.DireBear]: 0,
    [Druid.Form.Cat]: 0,
  },
  Rogue: {
    [Rogue.Buff.JustAFleshWound]: 0,
    [Rogue.Buff.T1_Tank_2pc]: 3,
  }
};

const buffNames = {
	[Paladin.Buff.Salv]: "Blessing of Salvation",
	[Paladin.Buff.GreaterSalv]: "Greater Blessing of Salvation",
	[Paladin.Buff.RighteousFury]: "Righteous Fury",
	25909: "Tranquil Air Totem",
	
  [Warrior.Stance.Defensive]: "Defensive Stance",
	[Warrior.Stance.Battle]: "Battle Stance",
	[Warrior.Stance.Berserker]: "Berserker Stance",
	[Warrior.Stance.Gladiator]: "Gladiator Stance",
	[Warrior.Buff.T1_Tank_6pc]: "S03 - Item - T1 - Warrior - Tank 6P Bonus",
	[Warrior.Buff.TAQ_Tank_4pc]: "S03 - Item - TAQ - Warrior - Tank 4P Bonus",
	[Warrior.Buff.RuneOfDevastate]: "Rune of Devastate",

	[Druid.Form.Bear]: "Bear Form",
	[Druid.Form.DireBear]: "Dire Bear Form",
	[Druid.Form.Cat]: "Cat Form",
	[Hunter.Buff.T1_Ranged_2pc]: "Ferocity",
	[Druid.Form.Moonkin]: "Moonkin Form",
	
  [Rogue.Buff.JustAFleshWound]: "Just a Flesh Wound",
	[Rogue.Buff.MainGauche]: "Main Gauche",
  [Rogue.Buff.T1_Tank_2pc]: "S03 - Item - T1 - Rogue - Tank 2P Bonus",

  [Items.Enchant.GlovesThreat]: "Enchant Gloves - Threat",
  [Items.Enchant.CloakSubtlety]: "Enchant Cloak - Subtlety",
}

const buffMultipliers = {
	[Paladin.Buff.Salv]:  getThreatCoefficient(Paladin.Mods.Salvation),		// BoS
	[Paladin.Buff.GreaterSalv]: getThreatCoefficient(Paladin.Mods.Salvation),		// GBoS
	[Paladin.Buff.RighteousFury]: getThreatCoefficient({[School.Holy]: 1.6}),	// Righteous Fury
	
  25909: getThreatCoefficient(0.8),		// Tranquil Air Totem Aura
	
  [Warrior.Stance.Defensive]: getThreatCoefficient(Warrior.Mods.DefensiveStance),
	[Warrior.Stance.Battle]:    getThreatCoefficient(Warrior.Mods.OtherStances),
	[Warrior.Stance.Berserker]: getThreatCoefficient(Warrior.Mods.OtherStances),
	[Warrior.Stance.Gladiator]: getThreatCoefficient(Warrior.Mods.GladiatorStance),
  [Warrior.Buff.T1_Tank_6pc]: {
    coeff: (buffs, spellId) => {
      if (Warrior.Stance.Defensive in buffs) {
        return getThreatCoefficient(Warrior.Mods.T1_Tank_6pc);
      }
      return getThreatCoefficient(1);
    }
  },
  [Warrior.Buff.TAQ_Tank_4pc]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [Warrior.Spell.ShieldSlamR1]: true,
        [Warrior.Spell.ShieldSlamR2]: true,
        [Warrior.Spell.ShieldSlamR3]: true,
        [Warrior.Spell.ShieldSlamR4]: true,
      };
      if (spellId in moddedSpells) {
        return getThreatCoefficient(Warrior.Mods.TAQ_Tank_4pc);
      }
      
      return getThreatCoefficient(1);
    }
  },
  [Warrior.Buff.RuneOfDevastate]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [Warrior.Spell.Devastate]: true,
        [Warrior.Spell.DevastateSoD]: true,
      };
      if (Warrior.Stance.Defensive in buffs && spellId in moddedSpells) {
        return getThreatCoefficient(Warrior.Mods.RuneOfDevastate);
      }
      
      return getThreatCoefficient(1);
    }
  },


	[Druid.Form.Bear]:      getThreatCoefficient(Druid.Mods.DireBear),
	[Druid.Form.DireBear]:  getThreatCoefficient(Druid.Mods.DireBear),
	[Druid.Buff.T1_Tank_6pc]: getAdditiveThreatCoefficient(Druid.Mods.T1_Tank_6pc, Druid.Mods.DireBear),
	[Druid.Form.Moonkin]:   getThreatCoefficient({[School.Arcane]: 0.7, [School.Nature]: 0.7}),
	[Druid.Form.Cat]:       getThreatCoefficient(Druid.Mods.Cat),		// Cat Form
	
  [Hunter.Buff.T1_Ranged_2pc]: getThreatCoefficient(Hunter.Mods.T1_Ranged_2pc),
	
  [Rogue.Buff.JustAFleshWound]: getThreatCoefficient(Rogue.Mods.JustAFleshWound),
  [Rogue.Buff.MainGauche]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        // TODO: lower ranks
        [Rogue.Spell.SinisterStrikeR7]: true,
        [Rogue.Spell.SinisterStrikeR8]: true,
        [Rogue.Spell.PoisonedKnife]: true,
      };
      if (spellId in moddedSpells) {
        return getThreatCoefficient(Rogue.Mods.MainGauche);
      }
      
      return getThreatCoefficient(1);
    }
  },
  [Rogue.Buff.T1_Tank_2pc]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [Rogue.Spell.CrimsonTempest]: true,
        [Rogue.Spell.Blunderbuss]: true,
        [Rogue.Spell.FanOfKnives]: true,
      };
      if (Rogue.Buff.BladeDance in buffs && 
          Rogue.Buff.JustAFleshWound in buffs && 
          spellId in moddedSpells) {
        return getThreatCoefficient(Rogue.Mods.T1_Tank_2pc);
      }
      return getThreatCoefficient(1);
    }
  },

  [Items.Enchant.GlovesThreat]: getThreatCoefficient(Items.Mods.GlovesThreat),
  [Items.Enchant.CloakSubtlety]: getThreatCoefficient(Items.Mods.CloakSubtlety),
}


// The leaf elements are functions (buffs,rank) => threatCoefficient
const talents = {
	Warrior: {
		Defiance: {
			maxRank: 5,
			coeff: function(buffs, rank=5) {
				if (!(Warrior.Stance.Defensive in buffs)) return getThreatCoefficient(1);
				return getAdditiveThreatCoefficient(Warrior.Mods.Defiance * rank, Warrior.Mods.DefensiveStance);
			}
		},
		'Furious Thunder (Rune)': {
			maxRank: 1,
			coeff: function(buffs, rank='0', spellId) {
        const thunderClap = {
          [Warrior.Spell.ThunderClapR1]: true,
          [Warrior.Spell.ThunderClapR2]: true,
          [Warrior.Spell.ThunderClapR3]: true,
          [Warrior.Spell.ThunderClapR4]: true,
          [Warrior.Spell.ThunderClapR5]: true,
          [Warrior.Spell.ThunderClapR6]: true,
        }
				if (Number(rank) && spellId in thunderClap) {
          return getThreatCoefficient(Warrior.Mods.FuriousThunder);
        }
				return getThreatCoefficient(1);
			}
		},
	},
	Druid: {
		"Feral Instinct": {
			maxRank: 5,
			coeff: function(buffs, rank=5) {
				if (!(Druid.Form.Bear in buffs) && !(Druid.Form.DireBear in buffs)) return getThreatCoefficient(1);
        return getAdditiveThreatCoefficient(Druid.Mods.FeralInstinct * rank, Druid.Mods.DireBear);
			}
	
		},
		"Moonkin Form": {
			maxRank: 1,
			coeff: function(buffs) {
				if (!(Druid.Form.Moonkin in buffs)) return getThreatCoefficient(1);
				return getThreatCoefficient({[School.Arcane]: 0.7, [School.Nature]: 0.7});
			}
		},
    "Subtlety": {
      maxRank: 5,
      coeff: (_, rank = 5, spellId) => getThreatCoefficient(1 - 0.04 * rank * (spellId in {
        8936: true,
        8938: true,
        8940: true,
        8941: true,
        9750: true,
        9856: true,
        9857: true,
        9858: true,
        26980: true,
        774: true,
        1058: true,
        1430: true,
        2090: true,
        2091: true,
        3627: true,
        8910: true,
        9839: true,
        9840: true,
        9841: true,
        25299: true,
        26981: true,
        26982: true,
        26982: true,
        5185: true,
        5186: true,
        5187: true,
        5188: true,
        5189: true,
        6778: true,
        8903: true,
        9758: true,
        9888: true,
        9889: true,
        25297: true,
        26978: true,
        26979: true,
        740: true,
        8918: true,
        9862: true,
        9863: true,
        26983: true,
        [Druid.Spell.WildGrowth]: true,
        [Druid.Spell.Lifebloom]: true,
        [Druid.Spell.LifebloomTick]: true,
        [Druid.Spell.Nourish]: true,
        [Druid.Spell.LivingSeed]: true,
      })),
    }
	},
	Mage: {
		"Arcane Subtlety": {
			maxRank: 2,
			coeff: (_,rank=2) => getThreatCoefficient({[School.Arcane]: 1-0.2*rank}),
		},
		"Burning Soul": {
			maxRank: 2,
			coeff: (_,rank=2) => getThreatCoefficient({[School.Fire]: 1-0.15*rank}),
		},
		"Frost Channeling": {
			maxRank: 3,
			coeff: (_,rank=3) => getThreatCoefficient({[School.Frost]: 1-0.1*rank}),
		}
	},



	Paladin: {
		"Improved Righteous Fury": {
			maxRank: 3,
			coeff: function(buffs, rank=3) {
				//if (!(407627 in buffs)) return getThreatCoefficient(1);
				let amp = 1 + Math.floor(rank*50/3) / 100;  
				return getThreatCoefficient({
					[School.Physical]: 1.5,  // Physical spells are always 1.5x
					[School.Holy]: (1 + 0.6 * amp) / 1.6 // Holy coefficient calculation, based on RF talent rank
				});
				//return getThreatCoefficient({[School.Physical]:1.5, [School.Holy]:2.85}); // 2.85 Something like this.
			}
		}
	},

	/*
	Tank Rune + Imp RF = 2.85 HOLY CO-EFFICIENT
	Tank Rune = Damage 1.5x NON HOLY
	Tank Rune = 2.23 without Imp RF Talent.

	OLD VALUES:
	1.0x non-holy
	1.6x holy RF non-Imp
	1.9x holy Imp RF
	*/

	Priest: {
		"Silent Resolve": {
			maxRank: 5,
			coeff: (_,rank=5) => getThreatCoefficient(1-0.04*rank),
		},
		"Shadow Affinity": {
			maxRank: 3,
			coeff: (_,rank=3) => getThreatCoefficient({[School.Shadow]: 1-Math.floor(rank*25/3)/100}),
		}
	},
	Shaman: {
		"Healing Grace": {
			maxRank: 3,
			coeff: (_,rank=3,spellId) => getThreatCoefficient(1 - 0.05 * rank * (spellId in {
					8004:true,8008:true,8010:true,10466:true,10467:true,10468:true, // Lesser Healing Wave
					331:true,332:true,547:true,913:true,939:true,959:true,8005:true,10395:true,10396:true,25357:true, // Healing Wave
					1064:true,10622:true,10623:true, // Chain Heal
				})),
		},
	},
}

// These make dots green-bordered
const invulnerabilityBuffs = {
	498: "Divine Protection",
	5573: "Divine Protection",
	642: "Divine Shield",
	1020: "Divine Shield",
	1022: "Blessing of Protection",
	5599: "Blessing of Protection",
	10278: "Blessing of Protection",
	11958: "Ice Block",
	3169: "LIP", // Limited Invulnerability Potion
	19752: "Divine Intervention",
	6724: "Light of Elune",
}
// These make dots yellow-bordered
const aggroLossBuffs = {
	118: true, 12824: true, 12825: true, 28272: true, 28271: true, 12826: true, // Mages' Polymorph
	23023: true, // Razorgore Conflagrate
	23310: true, 23311: true, 23312: true, // Chromaggus Time Lapse
	22289: true, // Brood Power: Green
	20604: true, // Lucifron Dominate Mind
	24327: true, // Hakkar's Cause Insanity
	23603: true, // Nefarian: Wild Polymorph
	26580: true, // Princess Yauj: Fear
}
// These make dots orange
const fixateBuffs = {
	355: true, // Taunt
	407631: true, // Hand of Reckoning
	1161: true, // Challenging Shout
	5209: true, // Challenging Roar
	6795: true, // Growl
	694: true, 7400: true, 7402: true, 20559: true, 20560: true, // Mocking Blow
	29060: true, // Deathknight Understudy Taunt
	[Rogue.Spell.Tease]: true,
}
// These make a dot in the graph on application and removal
// Also used for event filtering in fetchWCLreport
const notableBuffs = {
	23397: true, // Nefarian's warrior class call
	23398: true, // Druid class call
};
for (let k in buffMultipliers) notableBuffs[k] = true;
for (let k in invulnerabilityBuffs) notableBuffs[k] = true;
for (let k in aggroLossBuffs) notableBuffs[k] = true;
for (let k in fixateBuffs) notableBuffs[k] = true;
for (let id of Object.values(Warrior.Buff)) notableBuffs[id] = true;
for (let id of Object.values(Rogue.Buff)) notableBuffs[id] = true;
for (let id of Object.values(Druid.Buff)) notableBuffs[id] = true;
for (let id of Object.values(Hunter.Buff)) notableBuffs[id] = true;


const Cat = Druid.Form.Cat;
const Bear = Druid.Form.DireBear;
const Moonkin = Druid.Form.Moonkin;

const Battle = Warrior.Stance.Battle;
const Defensive = Warrior.Stance.Defensive;
const Berserker = Warrior.Stance.Berserker;

const auraImplications = {
	Warrior: {
		7384: Battle, 7887: Battle, 11584: Battle, 11585: Battle, //Overpower
		100: Battle, 6178: Battle, 11578: Battle, //Charge
		6343: Battle, 8198: Battle, 8204: Battle, 8205: Battle, 11580: Battle, 11581: Battle, //Thunderclap
		694: Battle, 7400: Battle, 7402: Battle, 20559: Battle, 20560: Battle, //Mocking Blow
		20230: Battle, //Retaliation
		12292: Battle, //Sweeping Strikes
		20252: Berserker, 20617: Berserker, 20616: Berserker, //Intercept
		1680: Berserker, //Whirlwind
		18499: Berserker, //Berserker Rage
		1719: Berserker, //Recklessness
		6552: Berserker, 6554: Berserker, //Pummel
		355: Defensive, //Taunt
		676: Defensive, //Disarm
		6572: Defensive, 6574: Defensive, 7379: Defensive, 11600: Defensive, 11601: Defensive, 25288: Defensive, //Revenge
		2565: Defensive, //Shield Block
		871: Defensive, //Shield Wall
		[Warrior.Spell.DevastateSoD]: Defensive,
	},
	Druid: {
    // Dire Bear Form
		6807: Bear, 6808: Bear, 6809: Bear, 8972: Bear, 9745: Bear, 9880: Bear, 9881: Bear, //Maul
		779: Bear, 780: Bear, 769: Bear, 9754: Bear, 9908: Bear, //Swipe
		414644: Bear, 414644: Bear, //Lacerate
		407995: Bear, //Mangle (Bear)
		99: Bear, 1735: Bear, 9490: Bear, 9747: Bear, 9898: Bear, //Demoralizing Roar
		6795: Bear, //Growl
		5229: Bear, //Enrage
		17057: Bear, //Furor
		8983: Bear, //Bash
    
    // Cat Form
		9850: Cat, //Claw
		407993: Cat, //Mangle (Cat)
		9830: Cat, //Shred
		9904: Cat, //Rake
		22829: Cat, //Ferocious Bite
		9867: Cat, //Ravage
		9896: Cat, //Rip
		9827: Cat, //Pounce
		9913: Cat, //Prowl
		9846: Cat, 417045: Cat, //Tiger's Fury
		407988: Cat, //Savage Roar
		411128: Cat, //Swipe (Cat)
		1850: Cat, 9821: Cat, //Dash

    // Moonkin Form - Since Starsurge and Starfall are Boomy skills, and take up Nourish and
    // Lifebloom slots, we can assume these abilities imply Moonkin form
    [Druid.Spell.Starsurge]: Moonkin,
    [Druid.Spell.Starfall]: Moonkin,
	},
  Rogue: {
    [Rogue.Spell.MainGauche]: Rogue.Buff.JustAFleshWound,
  }
}

/** 
 * Allows one to check the combatantInfo and infer buffs and talents. 
 * 
 * Here is a good place to check gear and apply Tier set bonus buffs. e.g. Check for 2pc gear, apply
 * the buff. Then, in buffMultipliers, you can apply global coefficients or to specific spells.
 */
const combatantImplications = {
  All: (unit, buffs) => {
    if (unit.gear.some(g => g.permanentEnchant === Items.Enchant.GlovesThreat)) {
      // console.log('applying gloves threat enchant');
      buffs[Items.Enchant.GlovesThreat] = true;
    }

    if (unit.gear.some(g => g.permanentEnchant === Items.Enchant.CloakSubtlety)) {
      // console.log('applying cloak Subtlety enchant');
      buffs[Items.Enchant.CloakSubtlety] = true;
    }
  },
  Warrior: (unit, buffs, talents) => {
    const taq = Object.values(Warrior.Tier.TAQ_Tank);

    if (unit.gear.filter(item => taq.includes(item.id)).length >= 4) {
      buffs[Warrior.Buff.TAQ_Tank_4pc] = true;
    }

    const t1 = Object.values(Warrior.Tier.T1_Tank);
    if (unit.gear.filter(item => t1.includes(item.id)).length >= 6) {
      buffs[Warrior.Buff.T1_Tank_6pc] = true;
    }

    const t2CoreForged = Object.values(Warrior.Tier.T2_Tank_CoreForged);
    if (unit.gear.filter(item => t2CoreForged.includes(item.id)).length >= 6) {
      buffs[Warrior.Buff.T1_Tank_6pc] = true;
    }
  },
};

const threatFunctions = {
	sourceThreatenTarget(ev, fight, amount, useThreatCoeffs = true, extraCoeff = 1) { // extraCoeff is only used for tooltip text
		let a = fight.eventToUnit(ev, "source");
		let b = fight.eventToUnit(ev, "target");
		if (!a || !b) return;
		let coeff = (useThreatCoeffs ? a.threatCoeff(ev.ability) : 1) * extraCoeff;
		b.addThreat(a.key, amount, ev.timestamp, ev.ability.name, coeff);
	},
	unitThreatenEnemiesSplit(ev, unit, fight, amount, useThreatCoeffs = true) {
		let u = fight.eventToUnit(ev, unit);
		if (!u) return;
		let coeff = useThreatCoeffs ? u.threatCoeff(ev.ability) : 1;
		let [_,enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
		let numEnemies = 0;
		for (let k in enemies) {
			if (enemies[k].alive) numEnemies += 1;
		}
		for (let k in enemies) {
			enemies[k].addThreat(u.key, amount / numEnemies, ev.timestamp, ev.ability.name, coeff);
		}
	},
	unitLeaveCombat(ev, unit, fight, text) {
		let u = fight.eventToUnit(ev, unit);
		if (!u) return;
		for (let k in fight.units) {
			if (!("threat" in fight.units[k]) || !(u.key in fight.units[k].threat)) continue;
			fight.units[k].setThreat(u.key, 0, ev.timestamp, text);
		}
	},
	threatWipe(sources, targets, time, text) {
		for (let a in sources) {
			let source = sources[a];
			for (let targetKey in targets) {
				source.setThreat(targetKey, 0, time, text);
			}
		}
	},
	concat() {
		return (ev, fight) => {
			for (let i = 0; i < arguments.length; ++i) { // Arguments is from outer func
				arguments[i](ev, fight);
			}
		};
	}
}

function handler_vanish(ev, fight) {
	if (ev.type !== "cast") return;
	threatFunctions.unitLeaveCombat(ev, "source", fight, ev.ability.name);
}
function handler_mindcontrol(ev, fight) {
	// Event target resets threat on everything on debuff apply and deapply.
	// Not sure if this is the real behaviour...
	if (ev.type === "applydebuff") {
		threatFunctions.unitLeaveCombat(ev, "target", fight, ev.ability.name);
	} else if (ev.type === "removedebuff") {
		threatFunctions.unitLeaveCombat(ev, "target", fight, ev.ability.name + " fades");
	}
}

function handler_resourcechange(ev, fight) {
	if (ev.type !== "resourcechange") return;
	let diff = ev.resourceChange - ev.waste;
	// Not sure if threat should be given to "target" instead...
	threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, (ev.resourceChangeType === 0) ? (diff / 2) : (diff * 5), false);
}
function handler_resourcechangeCoeff(ev, fight) {
	if (ev.type !== "resourcechange") return;
	let diff = ev.resourceChange - ev.waste;
	// Not sure if threat should be given to "target" instead...
	threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, (ev.resourceChangeType === 0) ? (diff / 2) : (diff * 5), true);
}

function handler_basic(ev, fight) {
	switch (ev.type) {
	case "damage":
		threatFunctions.sourceThreatenTarget(ev, fight, ev.amount + (ev.absorbed || 0));
		break;
	case "heal":
		if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
		threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, ev.amount / 2);
		break;
	case "resourcechange":
		if (DEBUGMODE) console.log("Unhandled resourcechange.", ev);
		handler_resourcechange(ev, fight);
		break;
	case "applybuff":
	case "refreshbuff":
	case "applybuffstack":
		if (DEBUGMODE) console.log("Unhandled buff.", ev);
		if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
		threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, 60);
		break;
	case "applydebuff":
	case "applydebuffstack":
	case "refreshdebuff":
		if (DEBUGMODE) console.log("Unhandled buff.", ev);
		if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
		threatFunctions.sourceThreatenTarget(ev, fight, 120);
		break;
	case "death":
	case "combatantinfo":
	case "encounterstart":
	case "encounterend":
	case "begincast":
	case "removebuffstack":
	case "removedebuffstack":
	case "extraattacks":
		break;
	default:
		if (DEBUGMODE) console.log("Unhandled event.", ev);
	}
}

function handler_mark(ev, fight) {
	if (ev.type !== "cast") return;
	if ("target" in ev && ev.target.id === -1) return; // Target is environment
	let a = fight.eventToUnit(ev, "source");
	let b = fight.eventToUnit(ev, "target");
	if (!a || !b) return;
	a.targetAttack(b.key, ev.timestamp, ev.ability.name);
	if (ev.ability.guid === 1 || ev.ability.guid < 0) {
		a.target = b;
	}
}

function handler_markSourceOnMiss(border) {
	return (ev, fight) => {
		if (ev.type !== "damage") return;
		if (ev.hitType !== 0 && ev.hitType <= 6) return;
		let a = fight.eventToUnit(ev, "source");
		let b = fight.eventToUnit(ev, "target");
		if (!a || !b) return;
		b.addMark(a.key, ev.timestamp, "Missed " + ev.ability.name, border);
	}
}

function handler_markSourceOnDebuff(border) {
	return (ev, fight) => {
		if (!["applydebuff","applydebuffstack","refreshdebuff"].includes(ev.type)) return;
		let a = fight.eventToUnit(ev, "source");
		let b = fight.eventToUnit(ev, "target");
		if (!a || !b) return;
		let s = ev.ability.name;
		//if (ev.type === "removedebuff") s += " fades";
		b.addMark(a.key, ev.timestamp, s, border);
	}
}

function handler_zero() {}

function handler_castCanMiss(threatValue) {
    return (ev, fight) => {
		let t = ev.type;
		if (t === "cast") {
			threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
		} else if (t === "damage") {
			threatFunctions.sourceThreatenTarget(ev, fight, -threatValue);
		}
    }
}

function handler_castCanMissNoCoefficient(threatValue) {
	return (ev, fight) => {
		let t = ev.type;
		if (t === "cast") {
			threatFunctions.sourceThreatenTarget(ev, fight, threatValue, false);
		} else if (t === "damage") {
			threatFunctions.sourceThreatenTarget(ev, fight, -threatValue, false);
		}
	}
}

function handler_modDamage(multiplier) {
	return (ev, fight) => {
		if (ev.type !== "damage") return;
		threatFunctions.sourceThreatenTarget(ev, fight, ev.amount + (ev.absorbed || 0), true, multiplier);
	}
}
function handler_modHeal(multiplier) {
	return (ev, fight) => {
		if (ev.type !== "heal") return;
		threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, multiplier * ev.amount / 2);
	}
}

function handler_modDamagePlusThreat(multiplier, bonus) {
	return (ev, fight) => {
		if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
		threatFunctions.sourceThreatenTarget(ev, fight, multiplier * (ev.amount + (ev.absorbed || 0)) + bonus);
	}
}

function handler_damage(ev, fight) {
	if (ev.type !== "damage") return;
	threatFunctions.sourceThreatenTarget(ev, fight, ev.amount + (ev.absorbed || 0));
}

function handler_heal(ev, fight) {
	if (ev.type !== "heal") return;
	threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, ev.amount / 2);
}

function handler_threatOnHit(threatValue) {
    return (ev, fight) => {
		if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
		threatFunctions.sourceThreatenTarget(ev, fight, ev.amount + (ev.absorbed || 0) + threatValue);
    }
}

function handler_bossDropThreatOnHit(pct) {
	return (ev, fight) => {
		// hitType 0=miss, 7=dodge, 8=parry, 10 = immune, 14=resist, ...
		// https://discordapp.com/channels/383596811517952002/673932163736928256/714590608819486740
		// [00:27] ResultsMayVary: Just to expand on this. Spell threat drops (resists) cause threat loss. Physical misses (dodges/parries) do not cause threat drops.
		if (ev.type !== "damage" || (ev.hitType > 6 && ev.hitType !== 10 && ev.hitType !== 14) || ev.hitType === 0) return;
		let a = fight.eventToUnit(ev, "source");
		let b = fight.eventToUnit(ev, "target");
		if (!a || !b) return;
		a.checkTargetExists(b.key, ev.timestamp);
		a.setThreat(b.key, a.threat[b.key].currentThreat * pct, ev.timestamp, ev.ability.name);
	}
}
function handler_bossDropThreatOnDebuff(pct) {
	return (ev, fight) => {
		if (ev.type !== "applydebuff") return;
		let a = fight.eventToUnit(ev, "source");
		let b = fight.eventToUnit(ev, "target");
		if (!a || !b) return;
		a.checkTargetExists(b.key, ev.timestamp);
		a.setThreat(b.key, a.threat[b.key].currentThreat * pct, ev.timestamp, ev.ability.name);
	}
}
function handler_bossDropThreatOnCast(pct) {
	return (ev, fight) => {
		if (ev.type !== "cast") return;
		let a = fight.eventToUnit(ev, "source");
		let b = fight.eventToUnit(ev, "target");
		if (!a || !b) return;
		a.checkTargetExists(b.key, ev.timestamp);
		a.setThreat(b.key, a.threat[b.key].currentThreat * pct, ev.timestamp, ev.ability.name);
	}
}
function handler_bossThreatWipeOnCast(ev, fight) {
	if (ev.type !== "cast") return;
	let u = fight.eventToUnit(ev, "source");
	if (!u) return;
	for (let k in u.threat) {
		u.setThreat(k, 0, ev.timestamp, ev.ability.name);
	}
}
function handler_bossPartialThreatWipeOnCast(pct) {
	return (ev, fight) => {
		if (ev.type !== "cast") return;
		let u = fight.eventToUnit(ev, "source");
		if (!u) return;
		for (let k in u.threat) {
			u.setThreat(k, u.threat[k].currentThreat * pct, ev.timestamp, ev.ability.name);
		}
	}
}

function handler_threatOnDebuff(threatValue) {
	return (ev, fight) => {
		let t = ev.type;
		if (t !== "applydebuff" && t !== "refreshdebuff") return;
		threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
	}
}

function handler_threatOnDebuffOrDamage(threatValue) {
	return (ev, fight) => {
		let t = ev.type;
		if (t === "applydebuff") {
			threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
		} else if (t === "damage") {
			threatFunctions.sourceThreatenTarget(ev, fight, ev.amount + (ev.absorbed || 0));
		}
	}
}

function handler_threatOnBuff(threatValue) {
	return (ev, fight) => {
		let t = ev.type;
		if (t !== "applybuff" && t !== "refreshbuff") return;
		threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, threatValue);
	}
}

function handler_taunt(ev, fight) {
	if (ev.type !== "applydebuff") return;
	let u = fight.eventToUnit(ev, "target");
	let v = fight.eventToUnit(ev, "source");
	if (!u || !v) return;
	if (!("threat" in u)) return;
	let maxThreat = 0;
	for (let k in u.threat) {
		maxThreat = Math.max(maxThreat, u.threat[k].currentThreat);
	}
	u.setThreat(v.key, maxThreat, ev.timestamp, ev.ability.name);
	u.target = v;
}

function handler_timelapse(ev, fight) {
	if (ev.type !== "applydebuff") return;
	let u = fight.eventToUnit(ev, "source");
	let v = fight.eventToUnit(ev, "target");
	if (!u || !v) return;
	u.setThreat(v.key, u.threat[v.key].currentThreat * v.threatCoeff(), ev.timestamp, ev.ability.name);
}

const spellFunctions = {

18670: handler_bossDropThreatOnHit(0.5), // Broodlord Knock Away
23339: handler_bossDropThreatOnHit(0.5), // BWL Wing Buffet
18392: handler_bossDropThreatOnCast(0), // Onyxia Fireball
19633: handler_bossDropThreatOnHit(.75), // Onyxia Knock Away
20534: handler_bossDropThreatOnCast(0), // Majordomo Teleport
20566: handler_bossThreatWipeOnCast, // Wrath of Ragnaros
23138: handler_bossThreatWipeOnCast, // Gate of Shazzrah
22289: handler_bossDropThreatOnDebuff(0.5), // Brood Power: Green
24408: handler_bossThreatWipeOnCast, // Bloodlord Mandokir's Charge
24690: handler_bossDropThreatOnDebuff(0), // Hakkar's Aspect of Arlokk
//20604: handler_mindcontrol, // Lucifron Dominate Mind
"-1": handler_bossThreatWipeOnCast, // Custom threat drop, currently for High Priestess Arlokk
23310: handler_timelapse,
23311: handler_timelapse,
23312: handler_timelapse,
800: function(ev, fight) { // Twin Emperors' Twin Teleport
	if (ev.type !== "applybuff") return;
	let u = fight.eventToUnit(ev, "source");
	for (let k in u.threat) {
		u.setThreat(k, 0, ev.timestamp, ev.ability.name);
	}
},
26102: handler_bossDropThreatOnHit(0), // Ouro's Sand Blast
26580: handler_bossDropThreatOnHit(0), // Yauj's Fear
26561: handler_bossThreatWipeOnCast, // Vem's Berserker Charge
11130: handler_bossDropThreatOnHit(0.5), // Qiraji Champion's Knock Away, need to confirm pct
28408: handler_bossThreatWipeOnCast, // Kel'Thuzad's Chains of Kel'Thuzad
29060: handler_taunt, // Deathknight Understudy Taunt
28835: handler_bossPartialThreatWipeOnCast(.5), // Mark of Zeliek
28834: handler_bossPartialThreatWipeOnCast(.5), // Mark of Mograine
28833: handler_bossPartialThreatWipeOnCast(.5), // Mark of Blaumeux
28832: handler_bossPartialThreatWipeOnCast(.5), // Mark of Korth'azz
	29210: handler_bossThreatWipeOnCast, // Noth's blink
	29211: handler_bossThreatWipeOnCast, // Noth's blink new id?

	17624: handler_vanish, // Flask of Petrification

// Paladin
25898: handler_threatOnBuff(60), // GBoK
25890: handler_threatOnBuff(60), // GBoL
25916: handler_threatOnBuff(60), // GBoM
25895: handler_threatOnBuff(60), // GBoS
25899: handler_threatOnBuff(60), // GBoSanc
25894: handler_threatOnBuff(54), // GBoW
25918: handler_threatOnBuff(60), // GBoW
19742: handler_threatOnBuff(14), // BoW
19850: handler_threatOnBuff(24), // BoW
19852: handler_threatOnBuff(34), // BoW
19853: handler_threatOnBuff(44), // BoW
19854: handler_threatOnBuff(54), // BoW
25290: handler_threatOnBuff(60), // BoW
20293: threatFunctions.concat(handler_threatOnBuff(58), handler_damage), // Seal of Righteousness r8
20286: handler_damage, // Judgement of Righteousness
26573: handler_damage, // Consecration r1
20116: handler_damage, // Consecration r2
20922: handler_damage, // Consecration r3
20923: handler_damage, // Consecration r4
20924: handler_damage, // Consecration r5
24239: handler_damage, // Hammer of Wrath
20925: handler_modDamage(1.2), // Holy Shield r1
20927: handler_modDamage(1.2), // Holy Shield r2
20928: handler_modDamage(1.2), // Holy Shield r3
465: handler_zero, // Devotion Aura r1
10290: handler_zero, // Devotion Aura r2
643: handler_zero, // Devotion Aura r3
10291: handler_zero, // Devotion Aura r4
1032: handler_zero, // Devotion Aura r5
10292: handler_zero, // Devotion Aura r6
10293: handler_zero, // Devotion Aura r7
19746: handler_zero, // Concentration Aura
19891: handler_zero, // Fire Resistance Aura r1
19899: handler_zero, // Fire Resistance Aura r2
19900: handler_zero, // Fire Resistance Aura r3
19888: handler_zero, // Frost Resistance Aura r1
19897: handler_zero, // Frost Resistance Aura r2
19898: handler_zero, // Frost Resistance Aura r3
19876: handler_zero, // S!== "damage" Retribution Aura r3
10300: handler_damage, // Retribution Aura r4
10301: handler_damage, // Retribution Aura r5
20218: handler_zero, // Sanctity Aura
// Paladin heals have .25 coefficient. Sources:
// cha#0438 2018-12-04 https://discordapp.com/channels/383596811517952002/456930992557654037/519502645858271243
//     [15:17] chaboi: but there is a grain of truth in that shitpost since paladin healing threat did get specifically nerfed by blizzard early on so they wouldnt be able to tank dungeons via just healing themselves
//     [15:18] chaboi: which is why paladin healing threat is 0.5, which is much lower than the other healers even if they talent into threat reduc
// 4man Onyxia https://classic.warcraftlogs.com/reports/TFqN9Z1HCxnLPypG
//     Paladin doesn't pull threat when he should at usual .5 heal coefficient.
635: handler_modHeal(.5), // Holy Light r1
639: handler_modHeal(.5), // Holy Light r2
647: handler_modHeal(.5), // Holy Light r3
1026: handler_modHeal(.5), // Holy Light r4
1042: handler_modHeal(.5), // Holy Light r5
3472: handler_modHeal(.5), // Holy Light r6
10328: handler_modHeal(.5), // Holy Light r7
10329: handler_modHeal(.5), // Holy Light r8
25292: handler_modHeal(.5), // Holy Light r9
19750: handler_modHeal(.5), // Flash of Light r1
19939: handler_modHeal(.5), // Flash of Light r2
19940: handler_modHeal(.5), // Flash of Light r3
19941: handler_modHeal(.5), // Flash of Light r4
19942: handler_modHeal(.5), // Flash of Light r5
19943: handler_modHeal(.5), // Flash of Light r6
//633: handler_modHeal(.5), // Lay on Hands r1 - Generates a total threat of heal * .5 instead of heal * .25
//2800: handler_modHeal(.5), // Lay on Hands r2
//10310: handler_modHeal(.5), // Lay on Hands r3
25914: handler_modHeal(.5), // Holy Shock r1
25913: handler_modHeal(.5), // Holy Shock r2
25903: handler_modHeal(.5), // Holy Shock r3
19968: handler_modHeal(.5), // Holy Light that appears in logs
19993: handler_modHeal(.5), // Flash of Light that appears in logs

// Mage
10181: handler_damage, // Frostbolt

// Rogue
1856: handler_vanish, 1857: handler_vanish, // Vanish
1966: handler_castCanMissNoCoefficient(-150), // Feint r1
6768: handler_castCanMissNoCoefficient(-240), // Feint r2
8637: handler_castCanMissNoCoefficient(-390), // Feint r3
11303: handler_castCanMissNoCoefficient(-600), // Feint r4
25302: handler_castCanMissNoCoefficient(-800), // Feint r5

// Rogue: SoD. Info from the compendium: https://docs.google.com/document/d/1BCCkILiz9U-VcX7489WGam2cK_Dm8InahnpQ3bS-UxA/edit?usp=sharing
[Rogue.Spell.Tease]: threatFunctions.concat(handler_taunt, handler_markSourceOnMiss(borders.taunt)),
[Rogue.Spell.UnfairAdvantage]: handler_modDamage(Rogue.Mods.UnfairAdvantage),

// Priest
6788: handler_zero, // Weakened Soul
8092: handler_threatOnHit(40), // Mind Blast r1
8102: handler_threatOnHit(77), // Mind Blast r2
8103: handler_threatOnHit(121), // Mind Blast r3
8104: handler_threatOnHit(180), // Mind Blast r4
8105: handler_threatOnHit(236), // Mind Blast r5
8106: handler_threatOnHit(303), // Mind Blast r6
10945: handler_threatOnHit(380), // Mind Blast r7
10946: handler_threatOnHit(460), // Mind Blast r8
10947: handler_threatOnHit(540), // Mind Blast r9
15237: handler_zero, // H!== "damage"oly Nova r1
15430: handler_zero, // Holy Nova r2
15431: handler_zero, // Holy Nova r3
27799: handler_zero, // Holy Nova r4
27800: handler_zero, // Holy Nova r5
27801: handler_zero, // Holy Nova r6
23455: handler_zero, // Holy Nova r1
23458: handler_zero, // Holy Nova r2
23459: handler_zero, // Holy Nova r3
27803: handler_zero, // Holy Nova r4
27804: handler_zero, // Holy Nova r5
27805: handler_zero, // Holy Nova r6

// Hunter
[Hunter.Spell.FeignDeath]: handler_vanish, // Feign Death
[Hunter.Spell.DistractingShotR1]: handler_threatOnHit(110), // Distracting Shot r1
[Hunter.Spell.DistractingShotR2]: handler_threatOnHit(160), // Distracting Shot r2
[Hunter.Spell.DistractingShotR3]: handler_threatOnHit(250), // Distracting Shot r3
[Hunter.Spell.DistractingShotR4]: handler_threatOnHit(350), // Distracting Shot r4
[Hunter.Spell.DistractingShotR5]: handler_threatOnHit(465), // Distracting Shot r5
[Hunter.Spell.DistractingShotR6]: handler_threatOnHit(600), // Distracting Shot r6
[Hunter.Spell.DisengageR1]: handler_castCanMiss(-140),  // Disengage Rank 1
[Hunter.Spell.DisengageR2]: handler_castCanMiss(-280), // Disengage Rank 2
[Hunter.Spell.DisengageR3]: handler_castCanMiss(-405), // Disengage Rank 3

// Warlock
18288: handler_zero, // Amplify Curse
603: handler_threatOnDebuffOrDamage(120), // Curse of Doom
18223: handler_zero, // Curse of Exhaustion
704: handler_threatOnDebuff(2*14), // CoR r1
7658: handler_threatOnDebuff(2*28), // CoR r2
7659: handler_threatOnDebuff(2*42), // CoR r3
11717: handler_threatOnDebuff(2*56), // CoR r4
17862: handler_threatOnDebuff(2*44), // CoS r1
17937: handler_threatOnDebuff(2*56), // CoS r2
1714: handler_threatOnDebuff(2*26), // CoT r1
11719: handler_threatOnDebuff(2*50), // CoT r2
702: handler_threatOnDebuff(2*4), // CoW r1
1108: handler_threatOnDebuff(2*12), // CoW r2
6205: handler_threatOnDebuff(2*22), // CoW r3
7646: handler_threatOnDebuff(2*32), // CoW r4
11707: handler_threatOnDebuff(2*42), // CoW r5
11708: handler_threatOnDebuff(2*52), // CoW r6
1490: handler_threatOnDebuff(2*32), // CotE r1
11721: handler_threatOnDebuff(2*46), // CotE r2
11722: handler_threatOnDebuff(2*60), // CotE r3
1454: handler_zero, // Life Tap r1
1455: handler_zero, // Life Tap r2
1456: handler_zero, // Life Tap r3
11687: handler_zero, // Life Tap r4
11688: handler_zero, // Life Tap r5
11689: handler_zero, // Life Tap r6
31818: handler_zero, // Life Tap script
5138: handler_zero, // Drain Mana r1
6226: handler_zero, // Drain Mana r2
11703: handler_zero, // Drain Mana r3
11704: handler_zero, // Drain Mana r4
689: handler_damage, // Drain Life r1
699: handler_damage, // Drain Life r2
709: handler_damage, // Drain Life r3
7651: handler_damage, // Drain Life r4
11699: handler_damage, // Drain Life r5
11700: handler_damage, // Drain Life r6
18265: handler_threatOnDebuffOrDamage(2*30), // Siphon Life r1
18879: handler_threatOnDebuffOrDamage(2*38), // Siphon Life r2
18880: handler_threatOnDebuffOrDamage(2*48), // Siphon Life r3
18881: handler_threatOnDebuffOrDamage(2*58), // Siphon Life r4
710: handler_threatOnDebuff(2*28), // Banish r1
18647: handler_threatOnDebuff(2*48), // Banish r2
5782: handler_threatOnDebuff(2*8), // Fear r1
6213: handler_threatOnDebuff(2*32), // Fear r2
6215: handler_threatOnDebuff(2*56), // Fear r3
172: handler_damage, // Corruption r1
6222: handler_damage, // Corruption r2
6223: handler_damage, // Corruption r3
7648: handler_damage, // Corruption r4
11671: handler_damage, // Corruption r5
11672: handler_damage, // Corruption r6
25311: handler_damage, // Corruption r7
980: handler_damage, // CoA r1
1014: handler_damage, // CoA r2
6217: handler_damage, // CoA r3
11711: handler_damage, // CoA r4
11712: handler_damage, // CoA r5
11713: handler_damage, // CoA r6
6789: handler_damage, // Death Coil r1
17925: handler_damage, // Death Coil r2
17926: handler_damage, // Death Coil r3
1120: handler_damage, // Drain Soul r1
8288: handler_damage, // Drain Soul r2
8289: handler_damage, // Drain Soul r3
11675: handler_damage, // Drain Soul r4
5484: handler_threatOnDebuff(2*40), // Howl of Terror r1
17928: handler_threatOnDebuff(2*54), // Howl of Terror r2
5676: handler_modDamage(2), // Searing Pain r1
17919: handler_modDamage(2), // Searing Pain r2
17920: handler_modDamage(2), // Searing Pain r3
17921: handler_modDamage(2), // Searing Pain r4
17922: handler_modDamage(2), // Searing Pain r5
17923: handler_modDamage(2), // Searing Pain r6

// Shaman
8042: handler_modDamage(2), // Earth Shock r1
8044: handler_modDamage(2), // Earth Shock r2
8045: handler_modDamage(2), // Earth Shock r3
8046: handler_modDamage(2), // Earth Shock r4
10412: handler_modDamage(2), // Earth Shock r5
10413: handler_modDamage(2), // Earth Shock r6
10414: handler_modDamage(2), // Earth Shock r7

// From ResultsMayVary https://resultsmayvary.github.io/ClassicThreatPerSecond/
		1: handler_damage,
        /* Consumables */
        11374: handler_threatOnDebuff(90), // Gift of Arthas
        /* Damage/Weapon Procs */
        20007: handler_zero, // Heroic Strength (Crusader)
        18138: handler_damage, // Shadow Bolt (Deathbringer Proc)
        24388: handler_damage, // Brain Damage (Lobotomizer Proc)
        23267: handler_damage, // Firebolt (Perdition's Proc)
        18833: handler_damage, // Firebolt (Alcor's Proc)
        
        21992: threatFunctions.concat(handler_damage, handler_threatOnDebuff(90)), // Thunderfury
        27648: handler_threatOnDebuff(145), // Thunderfury
        467271: handler_modDamage(2.25), // Dragonbreath (Dragonbreath Hand Cannon)
        
        /* Thorn Effects */
         9910: handler_damage, // Thorns (Rank 6)
        17275: handler_damage, // Heart of the Scale
        22600: handler_damage, // Force Reactive
        11350: handler_zero, // Oil of Immolation (buff)
        11351: handler_damage, // Oil of Immolation (dmg)
        
        // Razorbramble/Razorspike gear
        1213816: handler_modDamage(2), // Damage Shield Dmg +80
        1213813: handler_modDamage(2), // Damage Shield Dmg +100
        
        /* Explosives */
        13241: handler_damage, //("Goblin Sapper Charge"), //Goblin Sapper Charge
    
    
        /* Zero Threat Abilities */
        [Warrior.Stance.Defensive]: handler_zero,		// Defensive Stance
        [Warrior.Stance.Battle]:    handler_zero,		// Battle Stance
        [Warrior.Stance.Berserker]: handler_zero,		// Berserker Stance
        10610: handler_zero, //("Windfury Totem"), //Windfury Totem
        20572: handler_zero, //("Blood Fury"), //Blood Fury
        26296: handler_zero, //("Berserking (Troll racial)"), //Berserking (Troll racial)
        26635: handler_zero, //("Berserking (Troll racial)"), //Berserking (Troll racial)
        22850: handler_zero, //("Sanctuary"), //Sanctuary
         9515: handler_zero, //("Summon Tracking Hound"), //Summon Tracking Hound
    
        /* Consumable Buffs (zero-threat) */
        10667: handler_zero, //("Rage of Ages"), //Rage of Ages
        25804: handler_zero, //("Rumsey Rum Black Label"), //Rumsey Rum Black Label
        17038: handler_zero, //("Winterfall Firewater"), //Winterfall Firewater
         8220: handler_zero, //("Savory Deviate Delight (Flip Out)"), //Savory Deviate Delight (Flip Out)
        17543: handler_zero, //("Fire Protection"), //Fire Protection
        17548: handler_zero, //("Greater Shadow Protection Potion"), //Greater Shadow Protection Potion
        18125: handler_zero, //("Blessed Sunfruit"), //Blessed Sunfruit
        17538: handler_zero, //("Elixir of the Mongoose"), //Elixir of the Mongoose
        11359: handler_zero, //("Restorative Potion (Restoration) Buff"), //Restorative Potion (Restoration) Buff
        23396: handler_zero, //("Restorative Potion (Restoration) Dispel"), //Restorative Potion (Restoration) Dispel

        /* Physical */
        12721: handler_damage, //("Deep Wounds"),
         6552: handler_threatOnHit(76, "Pummel (Rank 1)"), //TODO: Verify these values ingame
         6554: handler_threatOnHit(116, "Pummel (Rank 2)"),
        
        23881: handler_damage, //("Bloodthirst"), //Rank 1
        23892: handler_damage, //("Bloodthirst"), //Rank 2
        23893: handler_damage, //("Bloodthirst"), //Rank 3
        23894: handler_damage, //("Bloodthirst"), //Rank 4
        23888: handler_zero, //("Bloodthirst"),   //Buff
        23885: handler_zero, //("Bloodthirst"),   //Buff
		23891: handler_heal, // BT heal buff
     
        //Heroic Strike
           78: handler_threatOnHit(16, "Heroic Strike"),
          284: handler_threatOnHit(39, "Heroic Strike"),
          285: handler_threatOnHit(59, "Heroic Strike"),
         1608: handler_threatOnHit(78, "Heroic Strike"),
        11564: handler_threatOnHit(98, "Heroic Strike"),
        11565: handler_threatOnHit(118, "Heroic Strike"),
        11566: handler_threatOnHit(137, "Heroic Strike"),
        11567: handler_threatOnHit(145, "Heroic Strike"),
        25286: handler_threatOnHit(175, "Heroic Strike"), // (AQ)
     
        //Shield Slam
      [Warrior.Spell.ShieldSlamR1]: handler_modDamage(Warrior.Mods.ShieldSlam),
      [Warrior.Spell.ShieldSlamR2]: handler_modDamage(Warrior.Mods.ShieldSlam),
      [Warrior.Spell.ShieldSlamR3]: handler_modDamage(Warrior.Mods.ShieldSlam),
      [Warrior.Spell.ShieldSlamR4]: handler_modDamage(Warrior.Mods.ShieldSlam),
     
		// Shield Bash
		72: handler_modDamagePlusThreat(1.5, 36),
		1671: handler_modDamagePlusThreat(1.5, 96),
		1672: handler_modDamagePlusThreat(1.5, 96), // THREAT UNKNOWN

        //Revenge
        11601: handler_modDamagePlusThreat(Warrior.Mods.Revenge, 243), //Rank 5
        25288: handler_modDamagePlusThreat(Warrior.Mods.Revenge, 270), //Rank 6 (AQ)
        12798: handler_zero, //("Revenge Stun"),           //Revenge Stun
     
        //Cleave
          845: handler_threatOnHit(10, "Cleave"),  //Rank 1
         7369: handler_threatOnHit(40, "Cleave"),  //Rank 2
        11608: handler_threatOnHit(60, "Cleave"),  //Rank 3
        11609: handler_threatOnHit(70, "Cleave"),  //Rank 4
        20569: handler_threatOnHit(100, "Cleave"), //Rank 5
     
        //Whirlwind
         1680: handler_modDamage(1.25), //("Whirlwind"), //Whirlwind
		6343: handler_modDamage(2.5), // Thunder Clap r1
		8198: handler_modDamage(2.5), // Thunder Clap r2
		8204: handler_modDamage(2.5), // Thunder Clap r3
		8205: handler_modDamage(2.5), // Thunder Clap r4
		11580: handler_modDamage(2.5), // Thunder Clap r5
		11581: handler_modDamage(2.5), // Thunder Clap r6

     
        //Hamstring
		1715: handler_modDamagePlusThreat(1.25, 20), // R1
		7372: handler_threatOnHit(101), // R2, from outdated sheet
        7373: handler_threatOnHit(145, "Hamstring"),
     
        //Intercept
        20252: handler_modDamage(2), //Intercept
        20253: handler_zero, //("Intercept Stun"),         //Intercept Stun (Rank 1)
        20616: handler_modDamage(2), //Intercept (Rank 2)
        20614: handler_zero, //("Intercept Stun"),         //Intercept Stun (Rank 2)
        20617: handler_modDamage(2), //Intercept (Rank 3)
        20615: handler_zero, //("Intercept Stun"),         //Intercept Stun (Rank 3)
     
        //Execute
        20647: handler_modDamage(1.25, "Execute"),
     
        /* Abilities */
        //Sunder Armor
		7386: handler_castCanMiss(45), // Rank 1
        11597: handler_castCanMiss(261, "Sunder Armor"), //Rank 5
     
        //Battleshout
        11551: handler_threatOnBuff(52, "Battle Shout"), //Rank 6
        25289: handler_threatOnBuff(60, "Battle Shout"), //Rank 7 (AQ)
     
        //Demo Shout
        11556: handler_threatOnDebuff(43, "Demoralizing Shout"),
     
        //Mocking Blow
        20560: threatFunctions.concat(handler_damage, handler_markSourceOnMiss(borders.taunt)), //("Mocking Blow"),
     
        //Overpower
        11585: handler_damage, //("Overpower"),
     
        //Rend
        11574: handler_damage, //("Rend"),



        /* Zero threat abilities */
         355: threatFunctions.concat(handler_taunt, handler_markSourceOnMiss(borders.taunt)), //("Taunt"), //Taunt
        1161: handler_markSourceOnMiss(borders.taunt), //("Challenging Shout"), //Challenging Shout
        2687: handler_resourcechangeCoeff, //("Bloodrage"), //Bloodrage (cast)
       29131: handler_resourcechange, //("Bloodrage"), //Bloodrage (buff)
       29478: handler_zero, //("Battlegear of Might"), //Battlegear of Might
       23602: handler_zero, //("Shield Specialization"), //Shield Specialization
       12964: handler_resourcechange, //("Unbridled Wrath"), //Unbridled Wrath
       11578: handler_zero, //("Charge"), //Charge
        7922: handler_zero, //("Charge Stun"), //Charge Stun
       18499: handler_zero, //("Berserker Rage"), //Berserker Rage
       12966: handler_zero, //("Flurry (Rank 1)"), //Flurry (Rank 1)
       12967: handler_zero, //("Flurry (Rank 2)"), //Flurry (Rank 2)
       12968: handler_zero, //("Flurry (Rank 3)"), //Flurry (Rank 3)
       12969: handler_zero, //("Flurry (Rank 4)"), //Flurry (Rank 4)
       12970: handler_zero, //("Flurry (Rank 5)"), //Flurry (Rank 5)
       12328: handler_zero, //("Death Wish"), //Death Wish
         871: handler_zero, //("Shield Wall"),
        1719: handler_zero, //("Recklessness"), //Recklessness
       12323: handler_zero, //("Piercing Howl"), //Piercing Howl
       14204: handler_zero, //("Enrage"), //Enrage
       12975: handler_zero, //("Last Stand (cast)"), //Last Stand (cast)
       12976: handler_zero, //("Last Stand (buff)"), //Last Stand (buff)
        2565: handler_zero, //("Shield Block"), //Shield Block


        /* Consumable */
         6613: handler_zero, //("Great Rage Potion"), //Great Rage Potion
        17528: handler_zero, //("Mighty Rage Potion"), //Mighty Rage Potion


        /* Forms */
        [Druid.Form.DireBear]: handler_zero, //(1.45, "Bear Form"),
        [Druid.Form.Cat]: handler_zero, //(0.71, "Cat Form"),

        /* Bear - See SoD Druid disc: https://discord.com/channels/253205420225724416/1186591609819762750/1310758667561467934 */
        // Mangle is 1.0x threat

         5209: handler_markSourceOnMiss(borders.taunt), // Challenging Roar
         6807: handler_modDamage(1.75, "Maul (Rank 1)"),
         6808: handler_modDamage(1.75, "Maul (Rank 2)"),
         6809: handler_modDamage(1.75, "Maul (Rank 3)"),
         8972: handler_modDamage(1.75, "Maul (Rank 4)"),
         9745: handler_modDamage(1.75, "Maul (Rank 5)"),
         9880: handler_modDamage(1.75, "Maul (Rank 6)"),
         9881: handler_modDamage(1.75, "Maul"),

          779: handler_modDamage(3.5, "Swipe (Rank 1)"),
          780: handler_modDamage(3.5, "Swipe (Rank 2)"),
          769: handler_modDamage(3.5, "Swipe (Rank 3)"),
         9754: handler_modDamage(3.5, "Swipe (Rank 4)"),
         9908: handler_modDamage(3.5, "Swipe"),

       414644: handler_modDamage(3.5), // Lacerate (Initial)
       414647: handler_modDamage(3.5), // Lacerate (Dot?)

           99: handler_threatOnDebuff(9, "Demoralizing Roar (Rank 1)"),
         1735: handler_threatOnDebuff(15, "Demoralizing Roar (Rank 2)"),
         9490: handler_threatOnDebuff(20, "Demoralizing Roar (Rank 3)"),
         9747: handler_threatOnDebuff(30, "Demoralizing Roar (Rank 4)"),
         9898: handler_threatOnDebuff(39, "Demoralizing Roar"),

         6795: threatFunctions.concat(handler_taunt, handler_markSourceOnMiss(borders.taunt)), //("Growl"),
         5229: handler_resourcechange, //("Enrage"),
        17057: handler_resourcechange, //("Furor"),

         8983: handler_zero, //("Bash"), //TODO test bash threat

        /* Cat */
         9850: handler_damage, //("Claw"),
         9830: handler_damage, //("Shred"),
         9904: handler_damage, //("Rake"),
        22829: handler_damage, //("Ferocious Bite"),
         9867: handler_damage, //("Ravage"),
         9896: handler_damage, //("Rip"),
         9827: handler_damage, //("Pounce"),
         9913: handler_zero, //("Prowl"),
         9846: handler_zero, //("Tiger's Fury"),

         1850: handler_zero, //("Dash (Rank 1)"),
         9821: handler_zero, //("Dash"),
         
         8998: handler_castCanMiss(-240, "Cower (Rank 1)"),
         9000: handler_castCanMiss(-390, "Cower (Rank 2)"),
         9892: handler_castCanMiss(-600, "Cower"),

        /* Healing */
        //TODO

        /* Abilities */
        16857: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 1)"),
        17390: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 2)"),
        17391: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 3)"),
        17392: handler_threatOnDebuff(108, "Faerie Fire (Feral)"),
        
         770: handler_threatOnDebuff(108, "Faerie Fire (Rank 1)"),
         778: handler_threatOnDebuff(108, "Faerie Fire (Rank 2)"),
        9749: handler_threatOnDebuff(108, "Faerie Fire (Rank 3)"),
        9907: handler_threatOnDebuff(108, "Faerie Fire"),

        16870: handler_zero, //("Clearcasting"),
        29166: handler_zero, //("Innervate"),

        22842: handler_heal, //("Frienzed Regeneration (Rank 1)"),
        22895: handler_heal, //("Frienzed Regeneration (Rank 2)"),
        22896: handler_heal, //("Frienzed Regeneration"),

        24932: handler_zero, //("Leader of the Pack"),

        /* Items */
        13494: handler_zero, //("Manual Crowd Pummeler"),
}

let zeroThreatSpells = [];
for (let i in spellFunctions) {
	if (i >= 0 && spellFunctions[i] === handler_zero) {
		zeroThreatSpells.push(i);
	}
}
