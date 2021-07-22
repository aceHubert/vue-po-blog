import { Vue, Component, ProvideReactive } from 'nuxt-property-decorator';
import { createMediaQueryDispatcher } from '@/utils/enquire';
import { DeviceType } from '@/configs/settings.config';

// screen and (max-width: 1087.99px)
const queries = {
  [DeviceType.Desktop]: 'screen and (min-width: 1200px)',
  [DeviceType.Tablet]: 'screen and (min-width: 576px) and (max-width: 1199px)',
  [DeviceType.Mobile]: 'screen and (max-width: 576px)',
};

@Component
export default class DeviceMixin extends Vue {
  enquireJs!: ReturnType<typeof createMediaQueryDispatcher>;

  @ProvideReactive()
  device: DeviceType = DeviceType.Desktop;

  @ProvideReactive()
  get isMobile() {
    return this.device === DeviceType.Mobile;
  }

  @ProvideReactive()
  get isDesktop() {
    return this.device === DeviceType.Desktop;
  }

  @ProvideReactive()
  get isTablet() {
    return this.device === DeviceType.Tablet;
  }

  mounted() {
    this.enquireJs = createMediaQueryDispatcher();
    this.enquireJs
      .register(queries[DeviceType.Mobile], () => (this.device = DeviceType.Mobile))
      .register(queries[DeviceType.Tablet], () => (this.device = DeviceType.Tablet))
      .register(queries[DeviceType.Desktop], () => (this.device = DeviceType.Desktop));
  }

  beforeDestroy() {
    this.enquireJs
      .unregister(queries[DeviceType.Mobile])
      .unregister(queries[DeviceType.Tablet])
      .unregister(queries[DeviceType.Desktop]);
  }
}
