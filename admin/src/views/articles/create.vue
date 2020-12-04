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
      <a-button :title="$tv('article.btnTips.reset', 'Reset all fields')" @click="handleReset">
        {{ $tv('article.btnText.reset', 'Reset') }}
      </a-button>
      <a-button
        type="primary"
        :title="$tv('article.btnTips.save', 'Save the article and publish it')"
        @click.prevent.stop="handleSubmit"
      >
        {{ $tv('article.btnText.save', 'Save') }}
      </a-button>
      <a-button
        type="primary"
        :title="$tv('article.btnTips.saveToDraft', 'Save the article into draft box')"
        @click.prevent.stop="handleSubmit(true)"
      >
        {{ $tv('article.btnText.saveToDraft', 'Save to Draft') }}
      </a-button>
    </a-card>
    <a-card :bordered="false">
      <EditForm ref="form" :default-values="defaultValues" />
    </a-card>
    <a-card
      size="small"
      :bordered="false"
      :style="{
        marginTop: '10px',
        textAlign: 'right',
      }"
    >
      <a-button :title="$tv('article.btnTips.reset', 'Reset all fields')" @click="handleReset">
        {{ $tv('article.btnText.reset', 'Reset') }}
      </a-button>
      <a-button
        type="primary"
        :title="$tv('article.btnTips.save', 'Save the article and publish it')"
        @click.prevent.stop="handleSubmit"
      >
        {{ $tv('article.btnText.save', 'Save') }}
      </a-button>
      <a-button
        type="primary"
        :title="$tv('article.btnTips.saveToDraft', 'Save the article into draft box')"
        @click.prevent.stop="handleSubmit(true)"
      >
        {{ $tv('article.btnText.saveToDraft', 'Save to Draft') }}
      </a-button>
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
    return {
      defaultValues: {
        author: '张三', // todo: 带上当前用户
      },
    };
  },
  methods: {
    handleReset() {
      this.$refs.form.reset();
    },
    handleSubmit(saveToDarft = false) {
      this.$refs.form.validate((values) => {
        const { tags, categoryIds, ...restValues } = values;
        const createParams = {
          tagsList: tags,
          categoryId: categoryIds.length ? categoryIds[0] : null, // todo: 多分类支持
          status: saveToDarft ? 1 : 2, // 1 草稿 2 文章
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
