import * as fs from 'fs';
import { ConfigOptions } from '../interfaces';

export function getOptionsFromFile(path: string): ConfigOptions {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`File "${path}" is not exists`);
    }
    throw err;
  }
}
