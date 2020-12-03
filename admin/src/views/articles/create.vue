<template>
  <div>
    <a-card
      size="small"
      :bordered="false"
      :style="{
        marginBottom: '10px',
        textAlign: 'right',
      }"
    >
      <a-button :style="{ marginRight: '8px' }" @click="handleReset"> {{ $tv('reset', 'Reset') }} </a-button>
      <a-button type="primary" @click.prevent.stop="handleSubmit"> {{ $tv('create', 'Create') }} </a-button>
    </a-card>
    <a-card :bordered="false">
      <EditForm ref="form" />
    </a-card>
    <a-card
      size="small"
      :bordered="false"
      :style="{
        marginTop: '10px',
        textAlign: 'right',
      }"
    >
      <a-button :style="{ marginRight: '8px' }" @click="handleReset"> {{ $tv('reset', 'Reset') }} </a-button>
      <a-button type="primary" @click.prevent.stop="handleSubmit"> {{ $tv('create', 'Create') }} </a-button>
    </a-card>
  </div>
</template>

<router>
{
  meta:{
    title: 'New'
  }
}
</router>

<script>
import { articleApi } from '@/includes/datas';
import EditForm from './modules/EditForm';

export default {
  name: 'ArticleCreate',
  components: {
    EditForm,
  },
  data() {
    return {};
  },
  methods: {
    handleReset() {
      this.$refs.form.reset();
    },
    handleSubmit() {
      this.$refs.form.validate((values) => {
        const { tags, categoryIds, ...restValues } = values;
        const createParams = {
          tagsList: tags,
          categoryId: categoryIds.length ? categoryIds[0] : null, // todo: 多分类支持
          status: 2, // 1 草稿 2 文章
          ...restValues,
        };

        // 创建文章
        articleApi
          .create(createParams)
          .then(() => {
            this.$router.replace({ name: 'articles', params: { refresh: true } });
          })
          .catch((err) => {
            this.$notification.error({
              message: this.$tv(err.code || 500, err.message),
            });
          });
      });
    },
  },
};
</script>
<style>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
