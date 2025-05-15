import { useCallback, useState } from "react";

export interface UnitSettings {
  color: string;
  talents: Record<string, number>;
  buffs: Record<string, number>;
}

export type UnitSettingsKey = keyof UnitSettings;

export type SetUnitSettings = (
  prop: UnitSettingsKey,
  keyOrColor: string,
  val?: number
) => void;

export type GlobalSettingsKey = Exclude<keyof ThreatSettings, "units">;

export type SetGlobalSetting = (prop: GlobalSettingsKey, val: boolean) => void;

export interface ThreatSettings {
  tranquilAir?: boolean;
  units: Record<string, UnitSettings>;
}

/**
 * Contains the session settings for overriding unit level buffs, talents and colors
 */
export function useUnitSettings() {
  const [unitSettings, setState] = useState<ThreatSettings>({ units: {} });

  const setUnitSetting = useCallback(
    (unitId: string, prop: UnitSettingsKey, key: string, value?: number) => {
      setState((prev) => {
        const unitSettings = prev.units[unitId] ?? {};
        return {
          ...prev,
          units: {
            ...prev.units,
            [unitId]: patchUnitSettings(unitSettings, prop, key, value),
          },
        };
      });
    },
    []
  );

  const setGlobalSetting = useCallback(
    (prop: GlobalSettingsKey, val: boolean) => {
      setState((prev) => {
        return { ...prev, [prop]: val };
      });
    },
    []
  );

  return { unitSettings, setUnitSetting, setGlobalSetting };
}

function patchUnitSettings(
  settings: UnitSettings,
  prop: UnitSettingsKey,
  keyOrColor: string,
  val?: number
) {
  if (prop === "color") {
    return {
      ...settings,
      [prop]: keyOrColor,
    };
  }
  const key = keyOrColor;
  return {
    ...settings,
    [prop]: {
      ...settings[prop],
      [key]: val,
    },
  };
}
