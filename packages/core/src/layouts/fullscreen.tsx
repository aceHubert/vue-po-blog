import { Vue, Component } from 'vue-property-decorator';
import { hook, themeFuncs } from '@/includes/functions';

// Types
import { CreateElement } from 'vue';
import { FullScreenLayouts } from 'types/functions/hook';

@Component({
  name: 'layout-fullscreen',
})
export default class LayoutFullscreen extends Vue {
  layout: Partial<FullScreenLayouts> = {
    rootWarp: undefined,
    mainWarp: undefined,
  };

  get isDark() {
    return themeFuncs.isDarkTheme();
  }

  created() {
    hook('layouts').exec(this.layout, 'fullscreen');
  }

  render(h: CreateElement) {
    const { rootWarp = 'div', mainWarp } = this.layout;
    return h(
      rootWarp,
      {
        staticClass: 'layout layout--fullscreen',
        class: `theme--${this.isDark ? 'dark' : 'light'}`,
        domProps: { id: 'fullscreen-layout', 'data-app': 'true' },
      },
      [mainWarp ? h(mainWarp, [h('nuxt')]) : h('nuxt')],
    );
  }
}
