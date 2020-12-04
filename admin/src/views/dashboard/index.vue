<template>
  <div id="dashboard">
    <div class="banner">
      <img alt="logo" style="width: 64px; height: 64px" src="/images/logo.png" />
      <h3 style="margin-top: 1rem">Welcome to Plumemo Blog</h3>
    </div>
  </div>
</template>

<router>
{
  meta:{
    title: 'Dashboard'
  }
}
</router>

<script>
export default {
  name: 'Dashboard',
};
</script>

<style scoped>
.banner {
  text-align: center;
  padding: 25px 0;
  margin: 25px 0;
}
</style>
