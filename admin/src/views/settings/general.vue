<template>
  <div class="app-container">
    <a-card :bordered="false">
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <a-form-item label="站点标题">
          <a-input v-decorator="['title', { rules: [{ required: true, message: '请输入标题!' }] }]" />
        </a-form-item>
        <a-form-item label="描述">
          <a-input v-decorator="['description', { rules: [{ required: true, message: '请输入描述!' }] }]" />
        </a-form-item>
        <a-form-item label="站点地址（URL）">
          <a-input v-decorator="['siteurl', { rules: [{ required: true, message: '请输入站点地址（URL）!' }] }]" />
        </a-form-item>
        <a-form-item label="邮件地址">
          <a-input v-decorator="['adminEmail', { rules: [{ required: true, message: '请输入邮件地址!' }] }]" />
        </a-form-item>
        <a-form-item label="成员资格"> <a-switch v-decorator="['membership']" />任何人都可以注册 </a-form-item>
        <a-form-item label="新用户默认角色">
          <a-select
            v-decorator="['roleId', { rules: [{ required: true, message: '请选择角色!' }] }]"
            placeholder="请选择角色"
            @change="handleSelectChange"
          >
            <a-select-option value="1"> 管理员 </a-select-option>
            <a-select-option value="2"> 编辑者 </a-select-option>
            <a-select-option value="3"> 作者 </a-select-option>
            <a-select-option value="4"> 投稿者 </a-select-option>
            <a-select-option value="5"> 订阅者 </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="站点语言">
          <a-select
            v-decorator="['language', { rules: [{ required: true, message: '请选择语言!' }] }]"
            placeholder="请选择语言"
            @change="handleSelectChange"
          >
            <a-select-option value="us">us English </a-select-option>
            <a-select-option value="cn">cn 简体中文 </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
          <a-button type="primary" html-type="submit"> 提交 </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<router>
{
  meta:{
    title: 'General Settings',
  }
}
</router>

<script>
import { optionsApi } from '@/includes/datas/options';
export default {
  name: 'SettingsGeneral',
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated_' }),
      optionsNameList: ['title', 'description', 'siteurl', 'adminEmail', 'roleId', 'language', 'membership'],
      model: {},
      membership: false,
    };
  },
  fetch() {
    return Promise.all([this.getOptions()]).catch(() => {
      // ignoer error
    });
  },
  created() {},
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);

          let arr = [];
          Object.keys(values).forEach((key) => {
            console.log(key, values[key]);
            arr.push({
              name: key,
              value: values[key],
            });
          });
          optionsApi.create(arr).then((res) => {
            console.log(res);
          });
        }
      });
    },
    handleSelectChange(value) {},
    onChange(e) {
      console.log(`checked = ${e.target.checked}`);
      this.membership = e.target.checked;
      this.$nextTick(() => {
        this.form.validateFields(['membership'], { force: true });
      });
    },
    getOptions() {
      optionsApi.getList(this.optionsNameList.join(',')).then((res) => {
        let model = res.rows.reduce((obj, curr) => {
          obj[curr['name']] = curr['value'];
          return obj;
        }, {});

        this.form = this.$form.createForm(this, {
          name: 'coordinated',
          mapPropsToFields: () => {
            // 默认值
            return Object.keys(model).reduce((prev, key) => {
              prev[key] = this.$form.createFormField({
                value: model[key],
              });
              return prev;
            }, {});
          },
        });
      });
    },
  },
};
</script>
