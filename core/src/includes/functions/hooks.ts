import { hasOwn } from '@vue-async/utils';
import POHook from '../classes/hook';

// Types
// import { Callback } from 'types/hook';
import { HookResult } from 'types/functions/hook';

export const globalFilters = POHook.buildPreinitializedHook({});

export function hook(tag: string): HookResult;
export function hook(tag: string, functionToAdd: Function, priority?: number, acceptedArgs?: number): void;
export function hook(tag: string, ...args: unknown[]): void | HookResult {
  if (args.length) {
    if (!hasOwn(globalFilters, tag)) {
      globalFilters[tag] = new POHook();
    }

    const functionToAdd = args[0] as Function;
    const priority = args[1] as number;
    const acceptedArgs = args[2] as number;
    globalFilters[tag].addFilter(functionToAdd, priority, acceptedArgs);
  } else {
    return {
      has(functionToCheck: Function | boolean) {
        if (!hasOwn(globalFilters, tag)) {
          return false;
        }

        return globalFilters[tag].hasFilter(functionToCheck);
      },
      remove(functionToRemove: Function, priority = 10) {
        let removed = false;
        if (hasOwn(globalFilters, tag)) {
          removed = globalFilters[tag].removeFilter(functionToRemove, priority);
        }
        return removed;
      },
      removeAll(priority: boolean | number) {
        if (hasOwn(globalFilters, tag)) {
          globalFilters[tag].removeAllFilters(priority);
        }
      },
      filter<T = unknown, R = T>(value: T, ...args: unknown[]) {
        if (hasOwn(globalFilters, 'all')) {
          // todo:apply tag "all" filter
        }

        if (hasOwn(globalFilters, tag)) {
          return globalFilters[tag].applyFilters<T, R>(value, ...args);
        }

        return Promise.resolve((value as unknown) as R);
      },
      exec(...args: unknown[]) {
        if (hasOwn(globalFilters, tag)) {
          return globalFilters[tag].doAction(...args);
        }
        return Promise.resolve();
      },
    };
  }
}
