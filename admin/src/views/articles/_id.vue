<template>
  <a-card :bordered="false"></a-card>
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
export default {
  name: 'ArticleUpdate',
  asyncData({ articleApi, route }) {
    return articleApi.get(route.params.id).then((model) => ({
      model,
    }));
  },
  data() {
    return {
      model: {},
    };
  },
};
</script>
