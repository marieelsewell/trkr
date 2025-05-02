<template>
  <div id="app">
      <nav>
      </nav>
      <router-view></router-view>
  </div>
</template>

<script>
export default {
  computed: {
    noScroll() {
      const noScrollRoutes = ['/login']; 
      return noScrollRoutes.includes(this.$route.path);
    }
  },
  watch: {
    noScroll(newVal) {
      if (newVal) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    }
  },
  mounted() {
    if (this.noScroll) {
      document.body.classList.add('no-scroll');
    }
  },
  beforeDestroy() {
    document.body.classList.remove('no-scroll');
  },
  name: 'App',
  data() {
    return {
    };
  }
};
</script>

<style src="./assets/style.css"></style>