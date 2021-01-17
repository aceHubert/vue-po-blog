import { http } from '../functions';

// Types
import { OptionsApi } from 'types/datas/options';

export const optionsApi: OptionsApi = {

    getList(optionsNameList) {
        return http
            .getList('admin/options', { params: { optionsNameList: optionsNameList } })
            .then(({ models }) => {
                return {
                    rows: models
                };
            });;
    },
    create(data) {
        return http.post("admin/options", data).then(() => true)
    }


}