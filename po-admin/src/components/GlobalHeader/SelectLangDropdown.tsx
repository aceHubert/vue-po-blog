import { Vue, Component, Prop, Emit } from 'nuxt-property-decorator';

// Types
import * as tsx from 'vue-tsx-support';
import { LangConfig } from 'types/functions/locale';

@Component({
  name: 'SelectLangDropdown',
})
export default class SelectLangDropdown extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<SelectLangDropdown, 'locale' | 'supportLanguages'>> &
    tsx.DeclareOnEvents<{
      onChange: (locale: string) => void;
    }>;

  @Prop(String) locale?: string;
  @Prop({ type: Array, required: true, validator: (val) => !!val.length }) supportLanguages!: LangConfig[];

  get currentLanguage() {
    const locale = this.locale || (this.$i18n && this.$i18n.locale);
    const lang = this.supportLanguages.find((lang) => lang.locale === locale || lang.alternate === locale);
    if (lang) {
      return lang;
    } else {
      return this.supportLanguages[0];
    }
  }

  @Emit('change')
  handleLocaleChange({ key }: { key: string }) {
    return key;
  }

  render() {
    return (
      <a-dropdown placement="bottomRight">
        <span class="ant-pro-drop-down">
          <a-icon type="global" title={this.currentLanguage.name} />
        </span>
        <template slot="overlay">
          <a-menu
            class="ant-pro-drop-down menu"
            selectedKeys={[this.currentLanguage.locale]}
            onClick={this.handleLocaleChange.bind(this)}
          >
            {this.supportLanguages.map((item) => (
              <a-menu-item key={item.locale} title={item.name}>
                <span role="img" aria-label={item.name}>
                  {item.icon}&nbsp;&nbsp;
                </span>{' '}
                {item.name}
              </a-menu-item>
            ))}
          </a-menu>
        </template>
      </a-dropdown>
    );
  }
}
