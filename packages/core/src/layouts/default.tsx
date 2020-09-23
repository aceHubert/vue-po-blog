import { Vue, Component } from 'vue-property-decorator';
import { Component as VueComponent, CreateElement } from 'vue';
import { hook } from '@/includes';

type Layout = {
  rootWarp: string | VueComponent;
  mainWarp?: string | VueComponent | null;
  header?: string | VueComponent | null;
  footer?: string | VueComponent | null;
};

@Component({
  name: 'layout-default',
})
export default class LayoutDefault extends Vue {
  layout: Layout = {
    rootWarp: 'div',
    mainWarp: null,
    header: null,
    footer: null,
  };

  created() {
    hook('layout').exec(this.layout, 'default');
  }

  render(h: CreateElement) {
    const { rootWarp = 'div', header, mainWarp, footer } = this.layout;
    return h(rootWarp, { staticClass: 'layout', domProps: { id: 'default-layout' } }, [
      header ? h(header) : null,
      mainWarp ? h(mainWarp, [h('nuxt')]) : h('nuxt'),
      footer ? h(footer) : null,
    ]);
  }
}
