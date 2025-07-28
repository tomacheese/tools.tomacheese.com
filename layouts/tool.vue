<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <NuxtLink to="/" class="logo">tools.tomacheese.com</NuxtLink>
          <nav class="nav">
            <NuxtLink to="/">ホーム</NuxtLink>
            <NuxtLink to="/about">サイトについて</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Layout with Sidebar -->
    <div class="main-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <h3 style="margin-bottom: 1rem; color: #1e293b; font-weight: 600">
          ツール一覧
        </h3>
        <nav>
          <ul class="sidebar-nav">
            <li v-for="tool in tools" :key="tool.id">
              <NuxtLink :to="tool.path">{{ tool.name }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// ツール一覧の取得
const { getAllTools } = useTools();
const tools = getAllTools();

// SEO and Meta
useHead({
  htmlAttrs: {
    lang: "ja",
  },
});
</script>
