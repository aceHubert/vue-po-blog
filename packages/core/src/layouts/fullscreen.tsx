import { Vue, Component } from 'vue-property-decorator';
import { Component as VueComponent, CreateElement } from 'vue';
import { hook } from '@/includes';

type Layout = {
  rootWarp: string | VueComponent;
  mainWarp: string | VueComponent | null;
};

@Component({
  name: 'layout-fullscreen',
})
export default class LayoutFullscreen extends Vue {
  layout: Layout = {
    rootWarp: 'div',
    mainWarp: null,
  };

  created() {
    hook('layout').exec(this.layout, 'fullscreen');
  }

  render(h: CreateElement) {
    const { rootWarp = 'div', mainWarp } = this.layout;
    return h(rootWarp, { staticClass: 'layout', domProps: { id: 'default-layout' } }, [
      mainWarp ? h(mainWarp, [h('nuxt')]) : h('nuxt'),
    ]);
  }
}
