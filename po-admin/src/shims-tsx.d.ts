import 'vue-tsx-support/enable-check';
import { InnerScopedSlotReturnType } from 'vue-tsx-support/types/base';

// import Vue, { VNode } from 'vue';

// declare global {
//   namespace JSX {
//     interface Element extends VNode {}
//     interface ElementClass extends Vue {}
//     interface IntrinsicElements {
//       [elem: string]: any;
//     }
//   }
// }

declare global {
  type InnerMultiArgsScopedSlot = (...args: any[]) => InnerScopedSlotReturnType;
  type InnerMultiArgsScopedSlots<T> = { [K in keyof T]: InnerMultiArgsScopedSlot };
}
