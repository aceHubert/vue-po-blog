import { http } from '../functions';

// Types
import { OptionsApi } from 'types/datas/options';

export const optionsApi: OptionsApi = {
  getList(optionsNameList) {
    return http.getList('admin/configs', { params: { keys: optionsNameList } }).then(({ models }) => {
      return {
        rows: models,
      };
    });
  },
  create(data) {
    return http.put('admin/configs', data).then(() => true);
  },
};
