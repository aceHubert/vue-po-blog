import Vue from 'vue';
import enquireJs from 'enquire.js';

export const DEVICE_TYPE = {
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
};

// screen and (max-width: 1087.99px)
const queries = {
  [DEVICE_TYPE.DESKTOP]: 'screen and (min-width: 1200px)',
  [DEVICE_TYPE.TABLET]: 'screen and (min-width: 576px) and (max-width: 1199px)',
  [DEVICE_TYPE.MOBILE]: 'screen and (max-width: 576px)',
};

export default Vue.extend({
  data() {
    return {
      device: DEVICE_TYPE.DESKTOP,
    };
  },
  methods: {
    isMobile() {
      return this.device === DEVICE_TYPE.MOBILE;
    },
    isDesktop() {
      return this.device === DEVICE_TYPE.DESKTOP;
    },
    isTablet() {
      return this.device === DEVICE_TYPE.TABLET;
    },
  },
  mounted() {
    enquireJs
      .register(queries[DEVICE_TYPE.MOBILE], () => (this.device = DEVICE_TYPE.MOBILE))
      .register(queries[DEVICE_TYPE.TABLET], () => (this.device = DEVICE_TYPE.TABLET))
      .register(queries[DEVICE_TYPE.DESKTOP], () => (this.device = DEVICE_TYPE.DESKTOP));
  },
  beforeDestroy() {
    enquireJs.unregister(queries[DEVICE_TYPE.MOBILE]);
    enquireJs.unregister(queries[DEVICE_TYPE.TABLET]);
    enquireJs.unregister(queries[DEVICE_TYPE.DESKTOP]);
  },
});
