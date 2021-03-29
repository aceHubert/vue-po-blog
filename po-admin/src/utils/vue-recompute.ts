/**
 * Forcing Re-computation of Vue's computed properties
 * ref: https://logaretm.com/blog/2019-10-11-forcing-recomputation-of-computed-properties/
 */
import Vue from 'vue';

/**
 * 使 computed 可以重新计算
 * @param fn computed 原始函数
 * @param propName 重新计算时触发的 propName，如省略则使用 fn.name
 */
export function recomputable<T extends Vue>(fn: (this: T) => unknown, propName?: string): () => unknown {
  const reactive = Vue.observable({
    backdoor: 0,
  });

  return function (this: T) {
    // initialize a map once.
    if (!this.$__recomputables) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      this.$__recomputables = {};
    }

    // add a reference to my reactive backdoor trigger.
    if (!this.$__recomputables[propName || fn.name]) {
      this.$__recomputables[propName || fn.name] = reactive;
    }

    // reference it!
    reactive.backdoor;

    return fn.call(this);
  };
}

/**
 * 重新 computed 函数
 * @param vm 实例对象
 * @param propName 重新计算的 propName
 */
export function recompute<T extends Vue>(vm: T, propName: string) {
  // handle non-existent props.
  if (!vm.$__recomputables || !vm.$__recomputables[propName]) {
    return;
  }

  vm.$__recomputables[propName].backdoor++;
}
