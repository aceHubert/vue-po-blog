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
        <a-form-item label="成员资格">
          <a-checkbox @change="onChange"> 任何人都可以注册 </a-checkbox>
        </a-form-item>
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
export default {
  name: 'SettingsGeneral',
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
    };
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
        }
      });
    },
    handleSelectChange(value) {
      console.log(value);
      this.form.setFieldsValue({
        note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
      });
    },
    onChange(e) {
      console.log(`checked = ${e.target.checked}`);
    },
  },
};
</script>
