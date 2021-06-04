import { LocaleModuleOptions } from '../interfaces/locale-module-options.interface';

const defaultOptions: Required<Omit<LocaleModuleOptions, 'path' | 'sites'>> = {
  filePattern: '*.json',
  parseFactory: (source) => JSON.parse(source),
};

export function mergeDefaults(
  options: LocaleModuleOptions,
  defaults: Required<Omit<LocaleModuleOptions, 'path' | 'sites'>> = defaultOptions,
): Required<LocaleModuleOptions> {
  const moduleOptions = {
    ...defaults,
    ...options,
  };

  return moduleOptions;
}
