/**
 * 使用 page(deepest level) 的 layout
 * https://www.nuxtjs.cn/guides/components-glossary/pages-layout (默认是 first level)
 */
import { Vue, Component } from 'nuxt-property-decorator';
import { getMatchedComponents } from '../utils/router';

@Component({
  layout: (cxt) => {
    // 获取嵌套页面最后一个的 layout
    let layout = getMatchedComponents(cxt.route).reverse()[0].options.layout;
    if (typeof layout === 'function') {
      layout = layout(cxt);
    }
    return layout;
  },
})
export default class VueNestedLayout extends Vue {}
