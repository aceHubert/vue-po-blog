import { Vue, Component } from 'nuxt-property-decorator';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CKEditor from '@ckeditor/ckeditor5-vue2';
// @ts-ignore
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

@Component({
  name: 'RichEditor',
  inheritAttrs: false,
})
export default class RichEditor extends Vue {
  render() {
    const props = {
      ...this.$attrs,
      editor: BalloonEditor,
    };

    return (
      <CKEditor.component
        {...{
          props,
          on: this.$listeners,
          scopedSlots: this.$scopedSlots,
        }}
      />
    );
  }
}
