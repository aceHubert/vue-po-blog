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
      <a-button :title="$tv('article.btnTips.back')" @click="handleGoBack">
        {{ $tv('article.btnText.back', 'Back') }}
      </a-button>
      <a-button type="primary" :title="$tv('article.btnTips.update')" @click.prevent.stop="handleSubmit">
        {{ $tv('article.btnText.update', 'Update') }}
      </a-button>
    </a-card>
    <a-card :bordered="false">
      <EditForm :default-values="model" :summary-required="true" ref="form" />
    </a-card>
    <a-card
      size="small"
      :bordered="false"
      :style="{
        marginTop: '10px',
        textAlign: 'right',
      }"
    >
      <a-button :title="$tv('article.btnTips.back')" @click="handleGoBack">
        {{ $tv('article.btnText.back', 'Back') }}
      </a-button>
      <a-button :title="$tv('article.btnTips.update')" type="primary" @click.prevent.stop="handleSubmit">
        {{ $tv('article.btnText.update', 'Update') }}
      </a-button>
    </a-card>
  </div>
</template>

<router>
{
  name:'articles-edit',
  meta:{
    title: 'Edit'
  }
}
</router>

<script>
import { articleApi } from '@/includes/datas';
import EditForm from './modules/EditForm';

export default {
  name: 'ArticleEdit',
  components: {
    EditForm,
  },
  asyncData({ articleApi, route }) {
    return articleApi.get(route.params.id).then((model) => ({
      id: parseInt(route.params.id),
      model,
    }));
  },
  data() {
    return {
      id: null,
      model: {},
    };
  },
  methods: {
    handleGoBack() {
      return this.$router.back();
    },
    handleSubmit() {
      this.$refs.form.validate((values) => {
        const { tags, categoryIds, ...restValues } = values;
        const updateParams = {
          tagsList: tags,
          categoryId: categoryIds.length ? categoryIds[0] : null, // todo: 多分类支持
          status: 2, // 1 草稿 2 文章
          ...restValues,
        };

        // 创建文章
        articleApi
          .update(this.id, updateParams)
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
