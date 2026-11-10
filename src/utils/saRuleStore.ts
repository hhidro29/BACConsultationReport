import { useState, useEffect } from 'react';
import { DEFAULT_ENGINE_CONFIG, EngineRuleConfig } from './saGuidelineEngine';

const STORAGE_KEY = 'bac_sa_engine_config_v1';
const EVENT_NAME = 'sa-engine-config-updated';

function cloneDefault(): EngineRuleConfig {
  return JSON.parse(JSON.stringify(DEFAULT_ENGINE_CONFIG)) as EngineRuleConfig;
}

export function mergeWithDefault(raw: Partial<EngineRuleConfig> | null | undefined): EngineRuleConfig {
  const base = cloneDefault();
  if (!raw || typeof raw !== 'object') return base;

  return {
    version: 1,
    thresholds: { ...base.thresholds, ...(raw.thresholds || {}) },
    patternTemplates: {
      ...base.patternTemplates,
      ...(raw.patternTemplates || {})
    },
    stage2Templates: { ...base.stage2Templates, ...(raw.stage2Templates || {}) },
    stage3SubtestTemplates: {
      ...base.stage3SubtestTemplates,
      ...(raw.stage3SubtestTemplates || {})
    },
    stage4Templates: { ...base.stage4Templates, ...(raw.stage4Templates || {}) }
  };
}

export function loadRuleConfig(): EngineRuleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    return mergeWithDefault(JSON.parse(raw));
  } catch {
    return cloneDefault();
  }
}

export function saveRuleConfig(cfg: EngineRuleConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function resetRuleConfig(): EngineRuleConfig {
  localStorage.removeItem(STORAGE_KEY);
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
