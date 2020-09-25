export type Callback = {
  func: Function;
  acceptedArgs: number;
};

export type HookResult = {
  has(functionToCheck?: Function | boolean): Function | boolean;
  remove(functionToRemove: Function, priority?: number): boolean;
  removeAll(priority: boolean | number): void;
  filter<T = unknown, R = T>(value: T, ...args: unknown[]): Promise<R>;
  exec(...args: unknown[]): Promise<void>;
};

export interface HookFunction {
  (tag: string): HookResult;
  (tag: string, functionToAdd: Function, priority?: number, acceptedArgs?: number): void;
}
