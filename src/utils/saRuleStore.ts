import { useState, useEffect } from 'react';
import { DEFAULT_ENGINE_CONFIG, EngineRuleConfig } from './saGuidelineEngine';
import { safeGetItem, safeSetItem, safeRemoveItem } from './safeStorage';

const STORAGE_KEY = 'bac_sa_engine_config_v1';
const EVENT_NAME = 'sa-engine-config-updated';

function cloneDefault(): EngineRuleConfig {
  return JSON.parse(JSON.stringify(DEFAULT_ENGINE_CONFIG)) as EngineRuleConfig;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Merge a stored override map onto its defaults, one key at a time.
 * A stored value is accepted only if it has the same shape as the default for that key
 * (same primitive type, or an object containing every default field with matching types);
 * otherwise the default is kept. This prevents corrupted or outdated storage from
 * producing `undefined` guidance text or non-numeric thresholds.
 */
function mergeRecord<T extends Record<string, any>>(base: T, raw: unknown): T {
  if (!isPlainObject(raw)) return base;
  const out: Record<string, any> = { ...base };
  for (const key of Object.keys(base)) {
    if (!(key in raw)) continue;
    const def = base[key];
    const val = (raw as Record<string, unknown>)[key];
    if (isPlainObject(def)) {
      if (isPlainObject(val)) out[key] = mergeRecord(def, val);
    } else if (typeof def === 'number') {
      if (typeof val === 'number' && Number.isFinite(val)) out[key] = val;
    } else if (typeof val === typeof def) {
      out[key] = val;
    }
  }
  return out as T;
}

export function mergeWithDefault(raw: Partial<EngineRuleConfig> | null | undefined): EngineRuleConfig {
  const base = cloneDefault();
  if (!isPlainObject(raw)) return base;

  return {
    version: base.version,
    thresholds: mergeRecord(base.thresholds, raw.thresholds),
    patternTemplates: mergeRecord(base.patternTemplates, raw.patternTemplates),
    stage2Templates: mergeRecord(base.stage2Templates, raw.stage2Templates),
    stage3SubtestTemplates: mergeRecord(base.stage3SubtestTemplates, raw.stage3SubtestTemplates),
    stage4Templates: mergeRecord(base.stage4Templates, raw.stage4Templates)
  };
}

export function loadRuleConfig(): EngineRuleConfig {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    return mergeWithDefault(JSON.parse(raw));
  } catch {
    return cloneDefault();
  }
}

export function saveRuleConfig(cfg: EngineRuleConfig): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function resetRuleConfig(): EngineRuleConfig {
  safeRemoveItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
  return cloneDefault();
}

export function isRuleConfigCustomized(cfg: EngineRuleConfig): boolean {
  return JSON.stringify(cfg) !== JSON.stringify(DEFAULT_ENGINE_CONFIG);
}

export function useRuleConfig() {
  const [config, setConfig] = useState<EngineRuleConfig>(() => loadRuleConfig());

  useEffect(() => {
    const sync = () => setConfig(loadRuleConfig());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const updateAndSave = (next: EngineRuleConfig) => {
    const merged = mergeWithDefault(next);
    saveRuleConfig(merged);
    setConfig(merged);
  };

  const resetToDefault = () => {
    const def = resetRuleConfig();
    setConfig(def);
    return def;
  };

  return {
    config,
    isCustomized: isRuleConfigCustomized(config),
    updateAndSave,
    resetToDefault
  };
}
