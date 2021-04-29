import * as path from 'path';
import { FileManageModuleOptions } from '../interfaces/file-manage-module-options.interface';

const defaultOptions: Required<FileManageModuleOptions> = {
  dest: path.resolve(process.cwd(), 'uploads'),
  staticPrefix: '/static',
  groupBy: 'month',
};

export function mergeDefaults(
  options: FileManageModuleOptions,
  defaults: Required<FileManageModuleOptions> = defaultOptions,
): Required<FileManageModuleOptions> {
  const moduleOptions = {
    ...defaults,
    ...options,
  };

  return moduleOptions;
}
