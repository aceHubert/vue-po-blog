import { Vue, Component } from 'vue-property-decorator';
import { hook, themeFuncs } from '@/includes/functions';

// Types
import { CreateElement } from 'vue';
import { DefaultLayouts } from 'types/functions/hook';

@Component({
  name: 'layout-default',
})
export default class LayoutDefault extends Vue {
  layout: Partial<DefaultLayouts> = {
    rootWarp: undefined,
    mainWarp: undefined,
    header: undefined,
    footer: undefined,
  };

  get isDark() {
    return themeFuncs.isDarkTheme();
  }

  created() {
    hook('layouts').exec(this.layout, 'default');
  }

  render(h: CreateElement) {
    const { rootWarp = 'div', header, mainWarp, footer } = this.layout;
    return h(
      rootWarp,
      {
        staticClass: 'layout layout--default',
        class: `theme--${this.isDark ? 'dark' : 'light'}`,
        domProps: { id: 'default-layout', 'data-app': 'true' },
      },
      [header ? h(header) : null, mainWarp ? h(mainWarp, [h('nuxt')]) : h('nuxt'), footer ? h(footer) : null],
    );
  }
}
