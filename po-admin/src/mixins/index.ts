import Vue from 'vue';
import globalMixin from './global';

Vue.mixin(globalMixin);

export { default as appMixin } from './app';
export { default as deviceMixin } from './device';
