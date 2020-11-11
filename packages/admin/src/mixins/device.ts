import Vue from 'vue';
import { mapState } from 'vuex';
import { deviceEnquire, DEVICE_TYPE } from '@/utils/device';

export default Vue.extend({
  computed: {
    ...mapState({
      device: (state: any) => state.app.device,
    }),
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
    const { $store } = this;
    deviceEnquire((deviceType: string) => {
      switch (deviceType) {
        case DEVICE_TYPE.DESKTOP:
          $store.commit('TOGGLE_DEVICE', 'desktop');
          $store.dispatch('setSidebar', true);
          break;
        case DEVICE_TYPE.TABLET:
          $store.commit('TOGGLE_DEVICE', 'tablet');
          $store.dispatch('setSidebar', false);
          break;
        case DEVICE_TYPE.MOBILE:
        default:
          $store.commit('TOGGLE_DEVICE', 'mobile');
          $store.dispatch('setSidebar', true);
          break;
      }
    });
  },
});
