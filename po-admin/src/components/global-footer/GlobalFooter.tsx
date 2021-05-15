import { Vue, Component } from 'nuxt-property-decorator';

@Component({
  name: 'GlobalFooter',
})
export default class GlobalFooter extends Vue {
  render() {
    return (
      <div class="po-global-footer">
        {this.$scopedSlots.default ? this.$scopedSlots.default(null) : null}
        {this.$scopedSlots.links ? <div class="po-global-footer__links">{this.$scopedSlots.links({})}</div> : null}
        <div class="po-global-footer__copyright">
          Copyright
          <a-icon type="copyright" /> 2019-{new Date().getFullYear()} <span> Plumemo</span>
        </div>
      </div>
    );
  }
}
