<template>
  <div class="home">
    <div class="banner">
      <img alt="logo" style="width: 64px; height: 64px" src="/images/logo.png" />
      <h3 style="margin-top: 1rem">Welcome to Plumemo</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>

<style scoped>
.home {
  width: 900px;
  margin: 0 auto;
  padding: 25px 0;
}
.home > .banner {
  text-align: center;
  padding: 25px 0;
  margin: 25px 0;
}
</style>
