import { Vue, Component, Prop, Inject } from 'nuxt-property-decorator';

// Types
import * as tsx from 'vue-tsx-support';
// import { Column } from 'ant-design-vue/types/table/column';

@Component({
  name: 'InlineTableRow',
})
export default class InlineTableRow extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<InlineTableRow, 'columns' | 'record' | 'index'>>;

  @Inject({ from: 'table' }) vcTable: any;

  @Prop({ type: Array, required: true }) columns!: object[];
  @Prop({ type: Object, required: true }) record!: Record<string, any>;
  @Prop({ type: Number }) index?: number;

  /**
   * fork from https://github.com/vueComponent/ant-design-vue/blob/next/components/table/index.tsx#L46
   */
  updateColumns(cols: any[] = []) {
    const columns: object[] = [];
    const { $slots, $scopedSlots } = this;
    cols.forEach((col) => {
      const { slots = {}, scopedSlots = {}, ...restProps } = col;
      const column: Record<string, any> = {
        ...restProps,
      };
      Object.keys(slots).forEach((key) => {
        const name = slots[key];
        if (column[key] === undefined && $slots[name]) {
          column[key] = $slots[name]!.length === 1 ? $slots[name]![0] : $slots[name];
        }
      });
      Object.keys(scopedSlots).forEach((key) => {
        const name = scopedSlots[key];
        if (column[key] === undefined && $scopedSlots[name]) {
          column[key] = $scopedSlots[name];
        }
      });
      // if (slotScopeName && $scopedSlots[slotScopeName]) {
      //   column.customRender = column.customRender || $scopedSlots[slotScopeName]
      // }
      if (col.children) {
        column.children = this.updateColumns(column.children);
      }
      columns.push(column);
    });
    return columns;
  }

  created() {
    console.log(this.vcTable);
  }

  render() {
    return null;
  }
}
