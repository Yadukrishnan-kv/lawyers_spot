import type { CmsData } from '@/lib/cms/types';

export function getStateSelectOptions(cms: CmsData, currentValue?: string) {
  const active = cms.states
    .filter((s) => s.active)
    .sort((a, b) => a.name.localeCompare(b.name));
  const options = active.map((s) => ({
    value: s.name,
    label: `${s.name} (${s.code})`,
  }));
  if (currentValue && !active.some((s) => s.name === currentValue)) {
    options.unshift({ value: currentValue, label: `${currentValue} (not in State Master)` });
  }
  return options;
}

export function defaultCityState(cms: CmsData): string {
  return cms.states.find((s) => s.active)?.name ?? '';
}
