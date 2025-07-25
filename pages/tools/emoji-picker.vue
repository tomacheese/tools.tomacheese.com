<template>
  <div class="tool-container">
    <h1>絵文字ピッカー</h1>
    <p>
      豊富な絵文字から選択してコピーできます。検索やカテゴリ別の表示、最近使用した絵文字の管理にも対応しています。
    </p>

    <!-- 検索バー -->
    <div class="search-section">
      <div class="search-input-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="絵文字を検索... (例: 笑顔、ハート、動物)"
          class="search-input"
        />
        <button
          v-if="searchQuery"
          class="clear-search"
          @click="clearSearch"
          title="検索をクリア"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- カテゴリタブ -->
    <div class="category-tabs">
      <button
        v-if="recentEmojis.length > 0"
        :class="['category-tab', { active: selectedCategory === 'recent' }]"
        @click="selectedCategory = 'recent'"
        title="最近使用した絵文字"
      >
        ⏰ 最近
      </button>
      <button
        v-for="category in EMOJI_CATEGORIES"
        :key="category.id"
        :class="['category-tab', { active: selectedCategory === category.id }]"
        @click="selectedCategory = category.id"
        :title="category.name"
      >
        {{ category.icon }} {{ category.name }}
      </button>
    </div>

    <!-- 絵文字グリッド -->
    <div class="emoji-grid-container">
      <div v-if="displayEmojis.length === 0" class="no-results">
        <p v-if="searchQuery">
          「{{ searchQuery }}」に一致する絵文字が見つかりませんでした。
        </p>
        <p v-else-if="selectedCategory === 'recent'">
          まだ使用した絵文字がありません。<br />
          絵文字をクリックして使い始めましょう！
        </p>
        <p v-else>このカテゴリには絵文字がありません。</p>
      </div>

      <div v-else class="emoji-grid">
        <button
          v-for="emoji in displayEmojis"
          :key="emoji.emoji + emoji.name"
          class="emoji-button"
          @click="selectEmoji(emoji)"
          :title="`${emoji.name} - クリックでコピー`"
        >
          <span class="emoji-char">{{ emoji.emoji }}</span>
          <span class="emoji-name">{{ emoji.name }}</span>
        </button>
      </div>
    </div>

    <!-- 選択した絵文字の詳細 -->
    <div v-if="selectedEmoji" class="emoji-details">
      <h3>選択中の絵文字</h3>
      <div class="selected-emoji-info">
        <div class="large-emoji">{{ selectedEmoji.emoji }}</div>
        <div class="emoji-info">
          <h4>{{ selectedEmoji.name }}</h4>
          <div class="emoji-meta">
            <div class="meta-item">
              <strong>文字:</strong>
              <code class="emoji-code">{{ selectedEmoji.emoji }}</code>
              <button
                class="copy-button small"
                @click="copyEmojiChar(selectedEmoji)"
              >
                コピー
              </button>
            </div>
            <div v-if="selectedEmoji.shortcodes.length > 0" class="meta-item">
              <strong>ショートコード:</strong>
              <div class="shortcodes">
                <code
                  v-for="code in selectedEmoji.shortcodes"
                  :key="code"
                  class="shortcode"
                >
                  {{ code }}
                </code>
              </div>
            </div>
            <div v-if="selectedEmoji.keywords.length > 0" class="meta-item">
              <strong>キーワード:</strong>
              <div class="keywords">
                <span
                  v-for="keyword in selectedEmoji.keywords"
                  :key="keyword"
                  class="keyword"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- バリエーション表示 -->
      <div v-if="emojiVariants.length > 0" class="emoji-variants">
        <h4>肌色バリエーション</h4>
        <div class="variant-grid">
          <button
            v-for="variant in emojiVariants"
            :key="variant.emoji"
            class="variant-button"
            @click="selectEmoji(variant)"
            :title="`${variant.name} - クリックでコピー`"
          >
            {{ variant.emoji }}
          </button>
        </div>
      </div>
    </div>

    <!-- 通知メッセージ -->
    <div
      v-if="copyMessage"
      class="copy-notification"
      :class="{ show: showCopyMessage }"
    >
      {{ copyMessage }}
    </div>

    <!-- 使用方法 -->
    <div class="usage-info">
      <h3>使用方法</h3>
      <ul>
        <li>カテゴリタブで絵文字の種類を選択できます</li>
        <li>検索バーで絵文字の名前やキーワードで検索できます</li>
        <li>絵文字をクリックするとクリップボードにコピーされます</li>
        <li>よく使う絵文字は「最近」タブに自動で保存されます</li>
        <li>人の絵文字には肌色バリエーションが表示される場合があります</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  EMOJI_CATEGORIES,
  searchEmojis,
  getEmojisByCategory,
  getRecentlyUsedEmojis,
  copyEmojiToClipboard,
  getEmojiVariants,
  type Emoji,
} from '~/utils/emoji'

// Reactive state
const searchQuery = ref('')
const selectedCategory = ref('smileys')
const selectedEmoji = ref<Emoji | null>(null)
const recentEmojis = ref<Emoji[]>([])
const copyMessage = ref('')
const showCopyMessage = ref(false)

// Computed properties
const displayEmojis = computed(() => {
  if (searchQuery.value.trim()) {
    return searchEmojis(searchQuery.value).slice(0, 200) // Limit search results
  }

  if (selectedCategory.value === 'recent') {
    return recentEmojis.value
  }

  return getEmojisByCategory(selectedCategory.value)
})

const emojiVariants = computed(() => {
  return selectedEmoji.value ? getEmojiVariants(selectedEmoji.value) : []
})

// Methods
const selectEmoji = async (emoji: Emoji) => {
  selectedEmoji.value = emoji
  const success = await copyEmojiToClipboard(emoji)

  if (success) {
    showCopyNotification(`${emoji.emoji} をコピーしました！`)
    updateRecentEmojis()
  } else {
    showCopyNotification('コピーに失敗しました')
  }
}

const copyEmojiChar = async (emoji: Emoji) => {
  try {
    await navigator.clipboard.writeText(emoji.emoji)
    showCopyNotification(`${emoji.emoji} をコピーしました！`)
  } catch {
    showCopyNotification('コピーに失敗しました')
  }
}

const showCopyNotification = (message: string) => {
  copyMessage.value = message
  showCopyMessage.value = true

  setTimeout(() => {
    showCopyMessage.value = false
  }, 2000)
}

const clearSearch = () => {
  searchQuery.value = ''
}

const updateRecentEmojis = () => {
  recentEmojis.value = getRecentlyUsedEmojis()
}

// Watchers
watch(searchQuery, newQuery => {
  if (newQuery.trim()) {
    selectedCategory.value = ''
  } else if (!selectedCategory.value) {
    selectedCategory.value = 'smileys'
  }
})

// Lifecycle hooks
onMounted(() => {
  updateRecentEmojis()

  // Set initial selected emoji to first emoji in smileys category
  const smileyEmojis = getEmojisByCategory('smileys')
  if (smileyEmojis.length > 0) {
    selectedEmoji.value = smileyEmojis[0]
  }
})

// SEO meta data
useHead({
  title: '絵文字ピッカー | Tools',
  meta: [
    {
      name: 'description',
      content:
        '豊富な絵文字から選択してコピーできます。検索やカテゴリ別の表示、最近使用した絵文字の管理にも対応。',
    },
  ],
})
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.search-section {
  margin: 2rem 0;
}

.search-input-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-search:hover {
  background: #f3f4f6;
  color: #374151;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 2rem 0;
  justify-content: center;
}

.category-tab {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.category-tab:hover {
  background: #e2e8f0;
}

.category-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.emoji-grid-container {
  min-height: 400px;
  margin: 2rem 0;
}

.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.emoji-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.emoji-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.emoji-char {
  font-size: 2rem;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.emoji-name {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.emoji-details {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 2rem 0;
}

.emoji-details h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.selected-emoji-info {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
}

.large-emoji {
  font-size: 4rem;
  line-height: 1;
  flex-shrink: 0;
}

.emoji-info {
  flex: 1;
}

.emoji-info h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.emoji-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item strong {
  color: #374151;
  font-size: 0.875rem;
}

.emoji-code {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.copy-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-button:hover {
  background: #2563eb;
}

.copy-button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.shortcodes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.shortcode {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.emoji-variants {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

.emoji-variants h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.variant-grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.variant-button {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.variant-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: scale(1.1);
}

.copy-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.copy-notification.show {
  transform: translateX(0);
  opacity: 1;
}

.usage-info {
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem 0;
}

.usage-info h3 {
  margin: 0 0 1rem 0;
  color: #92400e;
}

.usage-info ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #92400e;
}

.usage-info li {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }

  .category-tabs {
    gap: 0.25rem;
  }

  .category-tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.25rem;
    padding: 0.5rem;
  }

  .emoji-button {
    padding: 0.5rem 0.25rem;
  }

  .emoji-char {
    font-size: 1.5rem;
  }

  .emoji-name {
    font-size: 0.625rem;
  }

  .selected-emoji-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .large-emoji {
    font-size: 3rem;
  }

  .emoji-meta {
    align-items: center;
  }

  .meta-item {
    align-items: center;
    text-align: center;
  }

  .copy-notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>
