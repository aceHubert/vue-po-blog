import { ofType } from 'vue-tsx-support';
import {
  VContainer as _VContainer,
  VRow as _VRow,
  VCol as _VCol,
  VSpacer as _VSpacer,
  VFlex as _VFlex,
} from 'vuetify/lib';

const VContainer = ofType<ContainerProps>().convert(_VContainer as any);
const VRow = ofType<RowProps>().convert(_VRow as any);
const VCol = ofType<ColProps>().convert(_VCol as any);
const VSpacer = ofType().convert(_VSpacer as any);
const VFlex = ofType<FlexProps>().convert(_VFlex as any);

export { VContainer, VRow, VCol, VSpacer, VFlex };

export default {
  // eslint-disable-next-line @typescript-eslint/camelcase
  $_vuetify_subcomponents: {
    VContainer,
    VRow,
    VCol,
    VSpacer,
    VFlex,
  },
};

type ContainerProps = {
  'fill-height'?: boolean;
  fluid?: boolean;
};

// todo
type RowProps = {
  'no-gutters'?: boolean;
};

// todo
type ColProps = {
  cols?: boolean | string | number;
};

interface FlexProps {
  xs1?: boolean;
  xs2?: boolean;
  xs3?: boolean;
  xs4?: boolean;
  xs5?: boolean;
  xs6?: boolean;
  xs7?: boolean;
  xs8?: boolean;
  xs9?: boolean;
  xs10?: boolean;
  xs11?: boolean;
  xs12?: boolean;

  sm1?: boolean;
  sm2?: boolean;
  sm3?: boolean;
  sm4?: boolean;
  sm5?: boolean;
  sm6?: boolean;
  sm7?: boolean;
  sm8?: boolean;
  sm9?: boolean;
  sm10?: boolean;
  sm11?: boolean;
  sm12?: boolean;

  md1?: boolean;
  md2?: boolean;
  md3?: boolean;
  md4?: boolean;
  md5?: boolean;
  md6?: boolean;
  md7?: boolean;
  md8?: boolean;
  md9?: boolean;
  md10?: boolean;
  md11?: boolean;
  md12?: boolean;

  lg1?: boolean;
  lg2?: boolean;
  lg3?: boolean;
  lg4?: boolean;
  lg5?: boolean;
  lg6?: boolean;
  lg7?: boolean;
  lg8?: boolean;
  lg9?: boolean;
  lg10?: boolean;
  lg11?: boolean;
  lg12?: boolean;
}
