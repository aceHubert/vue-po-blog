import { ofType } from 'vue-tsx-support';
import { VAppBar } from 'vuetify/lib';

import { Colorable, Themable } from '../shared/types';

export default ofType<Props>().convert(VAppBar as any);

type Props = Colorable &
  Themable & {
    absolute?: boolean;
    app?: boolean;
    fixed?: boolean;
  };
