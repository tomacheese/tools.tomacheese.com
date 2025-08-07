<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <!-- サイドバー開閉ボタン（デスクトップのみ表示） -->
          <button
            class="sidebar-toggle"
            :aria-label="
              isSidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'
            "
            @click="toggleSidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <NuxtLink to="/" class="logo">tools.tomacheese.com</NuxtLink>
          <nav class="nav">
            <NuxtLink to="/">ホーム</NuxtLink>
            <NuxtLink to="/about">サイトについて</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Layout with Sidebar -->
    <div class="main-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
      <!-- Sidebar Navigation -->
      <aside class="sidebar" :class="{ collapsed: !isSidebarOpen }">
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

// サイドバーの開閉状態管理（ユーザー設定を永続化）
const isSidebarOpen = useState('sidebar-open', () => true)

// 初期状態をブラウザサイズで決定
onMounted(() => {
  // 1024px以上ならデスクトップとみなしてサイドバーを開く
  isSidebarOpen.value = window.innerWidth >= 1024
})

// サイドバー開閉のトグル関数
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// SEO and Meta
useHead({
  htmlAttrs: {
    lang: 'ja',
  },
})
</script>
