import { Vue, Component, Prop, Emit } from 'nuxt-property-decorator';
import AvatarDropdown from './AvatarDropdown';
import SelectLangDropdown from './SelectLangDropdown';

// Types
import * as tsx from 'vue-tsx-support';
import { User, Actions } from './AvatarDropdown';
import { LangConfig } from 'types/functions/locale';

@Component({
  name: 'RightContent',
})
export default class RightContent extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<
      tsx.PickProps<
        RightContent,
        'prefixCls' | 'isMobile' | 'topMenu' | 'user' | 'theme' | 'locale' | 'supportLanguages'
      >,
      'prefixCls' | 'isMobile' | 'supportLanguages'
    >
  > &
    tsx.DeclareOnEvents<{
      onAction: (key: Actions) => void;
      onLocaleChange: (locale: string) => void;
    }>;

  @Prop({ type: String, default: 'ant-pro-global-header-index-action' }) prefixCls!: string;
  @Prop({ type: Boolean, default: false }) isMobile!: boolean;
  @Prop({ type: Boolean, required: true }) topMenu!: boolean;
  @Prop({ type: String, required: true }) theme!: string;
  @Prop(Object) user?: User;
  @Prop(String) locale?: string;
  @Prop({ type: Array, default: () => [] }) supportLanguages!: LangConfig[];

  get wrpCls() {
    return {
      'ant-pro-global-header-index-right': true,
      [`ant-pro-global-header-index-${this.isMobile || !this.topMenu ? 'light' : this.theme}`]: true,
    };
  }

  @Emit('action')
  handleAction(key: Actions) {
    return key;
  }

  @Emit('localeChange')
  handleLocaleChange(locale: string) {
    return locale;
  }

  render() {
    return (
      <div class={this.wrpCls}>
        <AvatarDropdown class={this.prefixCls} user={this.user} onAction={this.handleAction.bind(this)} />
        {this.supportLanguages!.length ? (
          <SelectLangDropdown
            class={this.prefixCls}
            locale={this.locale}
            supportLanguages={this.supportLanguages!}
            onChange={this.handleLocaleChange.bind(this)}
          />
        ) : null}
      </div>
    );
  }
}
