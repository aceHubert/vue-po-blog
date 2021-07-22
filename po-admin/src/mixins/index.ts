import Vue from 'vue';
import GlobalMixin from './global';

Vue.mixin(GlobalMixin);

export { default as AppMixin } from './app';
export { default as DeviceMixin } from './device';
