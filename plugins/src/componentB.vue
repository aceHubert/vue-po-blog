<template>
  <div>
    <h1 class="title">Remote Commponent B</h1>
    <p>{{desc}}</p>
  </div>
</template>

<script>
export default {
  name: 'commponent-b',
  props: ['desc'],
};

(a) => {};
</script>

<style lang="scss" scoped>
.title {
  color: green;
}
</style>
