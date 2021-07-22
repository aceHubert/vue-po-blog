import { Vue, Component, Prop, Emit } from 'nuxt-property-decorator';
import './styles/locale-dropdown.less';

// Types
import * as tsx from 'vue-tsx-support';
import { Dropdown } from 'ant-design-vue/types/dropdown/dropdown';
import { LocaleConfig } from 'types/configs';

@Component({
  name: 'LocaleDropdown',
})
export default class LocaleDropdown extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<tsx.PickProps<LocaleDropdown, 'locale' | 'supportLanguages' | 'placement'>, 'placement'>
  > &
    tsx.DeclareOnEvents<{
      onChange: (locale: string) => void;
    }>;

  $scopedSlots!: tsx.InnerScopedSlots<{
    /** 语言图标位置自定义内容，参数：当前的语言配置 */
    default?: LocaleConfig;
  }>;

  /** 当前语言 code, 如果没有则会尝试从 $i18n 中取值 */
  @Prop(String) locale?: string;
  /** 支持的语言列表，长度必须大于0 */
  @Prop({ type: Array, required: true, validator: (val) => !!val.length }) supportLanguages!: LocaleConfig[];
  /** 下拉选项显示位置 */
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
    const prefixCls = 'global-header-locale';

    const renderIcon = function renderIcon(icon: any) {
      if (icon === undefined || icon === 'none' || icon === null) {
        return null;
      }

      return typeof icon === 'object' ? (
        <a-icon component={icon}></a-icon>
      ) : (
        <img class="flag-icon" src={icon} alt="flag icon" />
      );
    };

    return (
      <a-dropdown class={`${prefixCls}-dropdown`} placement={this.placement}>
        {this.$scopedSlots.default ? (
          this.$scopedSlots.default(this.currentLang)
        ) : (
          <span>
            <a-icon type="global" title={this.currentLang.name} />
          </span>
        )}
        <template slot="overlay">
          <a-menu
            class={`${prefixCls}-overlay__menu`}
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
