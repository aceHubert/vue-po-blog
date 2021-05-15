import { Vue, Component, Prop, Emit } from 'nuxt-property-decorator';

// Types
import * as tsx from 'vue-tsx-support';
import { LangConfig } from 'types/configs/locale';
import { Dropdown } from 'ant-design-vue/types/dropdown/dropdown';

@Component({
  name: 'LocaleDropdown',
})
export default class LocaleDropdown extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<
      tsx.PickProps<LocaleDropdown, 'locale' | 'supportLanguages' | 'showShortName' | 'placement'>,
      'showShortName' | 'placement'
    >
  > &
    tsx.DeclareOnEvents<{
      onChange: (locale: string) => void;
    }>;

  @Prop(String) locale?: string;
  @Prop({ type: Array, required: true, validator: (val) => !!val.length }) supportLanguages!: LangConfig[];
  @Prop({ type: Boolean, default: false }) showShortName!: boolean;
  @Prop({ type: String, default: 'bottomRight' }) placement!: Dropdown['placement'];

  get currentLang() {
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
    const renderIcon = function renderIcon(icon: any) {
      if (icon === undefined || icon === 'none' || icon === null) {
        return null;
      }

      return typeof icon === 'object' ? <a-icon component={icon}></a-icon> : <span role="icon">{icon}</span>;
    };

    return (
      <a-dropdown class="po-locale-dropdown" placement={this.placement}>
        <span>
          <a-icon type="global" title={this.currentLang.name} />
          {this.showShortName ? <span class="po-locale-dropdown__name">{this.currentLang.shortName}</span> : null}
        </span>
        <template slot="overlay">
          <a-menu
            class="po-locale-dropdown__menu"
            selectedKeys={[this.currentLang.locale]}
            onClick={this.handleLocaleChange.bind(this)}
          >
            {this.supportLanguages.map((item) => (
              <a-menu-item key={item.locale} title={item.name}>
                {renderIcon(item.icon)}
                {item.name}
              </a-menu-item>
            ))}
          </a-menu>
        </template>
      </a-dropdown>
    );
  }
}
