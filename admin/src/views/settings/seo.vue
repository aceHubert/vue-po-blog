<template>
  <div class="app-container">
    <a-card :bordered="false">
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <a-form-item label="描述">
          <a-input v-decorator="['description', { rules: [{ required: true, message: '请输入描述!' }] }]" />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-decorator="['keywords', { rules: [{ required: true, message: '输入你站点的关键!' }] }]" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
          <a-button type="primary" html-type="submit"> 提交 </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
