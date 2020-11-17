<template>
  <a-card :bordered="false"></a-card>
</template>

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
