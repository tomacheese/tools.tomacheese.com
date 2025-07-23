<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <NuxtLink to="/" class="logo"> Tools.tomacheese.com </NuxtLink>
          <nav class="nav">
            <NuxtLink to="/">ホーム</NuxtLink>
            <NuxtLink to="/about">サイトについて</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
// SEO and Meta
useHead({
  htmlAttrs: {
    lang: 'ja',
  },
})
</script>
