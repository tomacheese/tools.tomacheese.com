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
            <button
              class="theme-toggle"
              @click="toggleTheme"
              :title="`${getThemeName()} → 切り替え`"
            >
              <span>{{ getThemeIcon() }}</span>
              <span class="theme-name">{{ getThemeName() }}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Layout with Sidebar -->
    <div class="main-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <h3 class="sidebar-title">ツール一覧</h3>
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
const { getAllTools } = useTools()
const tools = getAllTools()

// ダークモード管理
const {
  toggleThemeMode,
  getThemeName,
  getThemeIcon,
  initialize: initializeDarkMode,
} = useDarkMode()

// ダークモード初期化
let cleanupDarkMode = null

onMounted(() => {
  cleanupDarkMode = initializeDarkMode()
})

onBeforeUnmount(() => {
  if (cleanupDarkMode) {
    cleanupDarkMode()
  }
})

// テーマ切り替えハンドラ
const toggleTheme = () => {
  toggleThemeMode()
}

// SEO and Meta
useHead({
  htmlAttrs: {
    lang: 'ja',
  },
})
</script>

<style scoped>
.theme-name {
  display: none;
}

@media (min-width: 640px) {
  .theme-name {
    display: inline;
  }
}
</style>
