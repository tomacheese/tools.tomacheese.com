export interface Tool {
  id: string
  name: string
  description: string
  path: string
  category: string
  keywords: string[]
}

export const useTools = () => {
  // プラグインから提供される実装済みツールリストを取得
  // ビルド時に自動検出されるため手動更新不要
  const { $implementedTools } = useNuxtApp()
  if (typeof $implementedTools === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn(
      '[useTools] $implementedTools is undefined. Plugins may not be loaded correctly.'
    )
  }
  const implementedTools = $implementedTools || new Set<string>()

  // すべてのツール定義（実装済み・未実装を含む）
  const allTools: Tool[] = [
    {
      id: 'color-picker',
      name: 'カラーピッカー',
      description:
        'HEX、RGB、HSLなど様々な形式でカラーコードを取得・変換できます。',
      path: '/tools/color-picker',
      category: 'デザイン',
      keywords: ['カラー', '色', 'hex', 'rgb', 'hsl', 'デザイン'],
    },
    {
      id: 'color-palette-generator',
      name: 'カラーパレット生成',
      description:
        'テーマカラーから調和する色彩パレットを生成します。補色、類似色、三色配色など色彩理論に基づいた配色を自動生成できます。',
      path: '/tools/color-palette-generator',
      category: 'デザイン',
      keywords: [
        'カラーパレット',
        '配色',
        '色彩理論',
        '補色',
        '類似色',
        '三色配色',
        '四色配色',
        '単色配色',
        'デザイン',
        'アクセシビリティ',
        'WCAG',
      ],
    },
    {
      id: 'character-counter',
      name: '文字数カウンター',
      description: 'テキストの文字数、行数、バイト数を瞬時にカウントします。',
      path: '/tools/character-counter',
      category: 'テキスト',
      keywords: ['文字数', 'カウント', 'テキスト', '行数', 'バイト'],
    },
    {
      id: 'text-statistics',
      name: 'テキスト統計・分析ツール',
      description:
        'テキストの詳細な統計情報を分析・表示します。可読性、複雑度、頻出単語など多角的に文章を評価できます。',
      path: '/tools/text-statistics',
      category: 'テキスト',
      keywords: [
        'テキスト分析',
        '統計',
        '可読性',
        '複雑度',
        '頻出単語',
        '文章評価',
        '日本語解析',
      ],
    },
    {
      id: 'gcd-lcm',
      name: '最大公約数・最小公倍数',
      description:
        '複数の数値の最大公約数（GCD）と最小公倍数（LCM）を計算します。',
      path: '/tools/gcd-lcm',
      category: '数学',
      keywords: ['最大公約数', '最小公倍数', 'gcd', 'lcm', '数学', '計算'],
    },
    {
      id: 'base64',
      name: 'Base64エンコード・デコード',
      description: 'テキストをBase64形式にエンコード・デコードします。',
      path: '/tools/base64',
      category: 'エンコーディング',
      keywords: ['base64', 'エンコード', 'デコード', '変換'],
    },
    {
      id: 'url-encoder',
      name: 'URLエンコード・デコード',
      description: 'URLの特殊文字をエンコード・デコードします。',
      path: '/tools/url-encoder',
      category: 'エンコーディング',
      keywords: ['url', 'エンコード', 'デコード', '特殊文字'],
    },
    {
      id: 'hash-generator',
      name: 'ハッシュ生成',
      description: 'MD5、SHA-1、SHA-256などのハッシュ値を生成します。',
      path: '/tools/hash-generator',
      category: 'セキュリティ',
      keywords: ['ハッシュ', 'md5', 'sha1', 'sha256', 'セキュリティ'],
    },
    {
      id: 'qr-generator',
      name: 'QRコード生成',
      description: 'テキストやURLからQRコードを生成します。',
      path: '/tools/qr-generator',
      category: 'ユーティリティ',
      keywords: ['qr', 'qrコード', '生成', 'url'],
    },
    {
      id: 'qr-reader',
      name: 'QRコード読み取り',
      description: '画像からQRコードを読み取り、テキストを抽出します。',
      path: '/tools/qr-reader',
      category: 'ユーティリティ',
      keywords: ['qr', 'qrコード', '読み取り', '画像', 'スキャン'],
    },
    {
      id: 'qr-batch-generator',
      name: 'QRコードバッチ生成',
      description:
        '複数のQRコードを一括生成・管理できる高機能ツール。CSV インポート、連番生成、バッチダウンロードに対応。',
      path: '/tools/qr-batch-generator',
      category: 'ユーティリティ',
      keywords: ['qr', 'qrコード', 'バッチ', '一括生成', 'csv', '連番', '管理'],
    },
    {
      id: 'password-generator',
      name: 'パスワード生成',
      description: 'セキュアなランダムパスワードを生成します。',
      path: '/tools/password-generator',
      category: 'セキュリティ',
      keywords: ['パスワード', '生成', 'ランダム', 'セキュリティ'],
    },
    {
      id: 'duplicate-line-remover',
      name: '重複行削除',
      description: 'テキストから重複する行を検出・削除します。',
      path: '/tools/duplicate-line-remover',
      category: 'テキスト',
      keywords: ['重複削除', 'テキスト処理', '行削除', 'クリーニング'],
    },
    {
      id: 'timestamp-converter',
      name: 'タイムスタンプ変換',
      description: 'Unix タイムスタンプと日時を相互変換します。',
      path: '/tools/timestamp-converter',
      category: 'ユーティリティ',
      keywords: ['タイムスタンプ', 'unix', '日時', '変換'],
    },
    {
      id: 'json-formatter',
      name: 'JSON整形',
      description: 'JSONデータを見やすく整形・バリデーションします。',
      path: '/tools/json-formatter',
      category: 'テキスト',
      keywords: ['json', '整形', 'フォーマット', 'バリデーション'],
    },
    {
      id: 'uuid-generator',
      name: 'UUID生成',
      description: 'ランダムなUUID (v4) を生成します。',
      path: '/tools/uuid-generator',
      category: 'ユーティリティ',
      keywords: ['uuid', 'guid', '生成', 'ランダム'],
    },
    {
      id: 'percentage-calculator',
      name: 'パーセント計算',
      description: '割合、増減率、パーセンテージを簡単に計算します。',
      path: '/tools/percentage-calculator',
      category: '数学',
      keywords: ['パーセント', '割合', '増減率', '計算'],
    },
    {
      id: 'unit-converter',
      name: '単位変換',
      description: '長さ、重さ、温度などの単位を変換します。',
      path: '/tools/unit-converter',
      category: 'ユーティリティ',
      keywords: ['単位', '変換', '長さ', '重さ', '温度'],
    },
    {
      id: 'regex-tester',
      name: '正規表現テスター',
      description: '正規表現のテストとマッチング結果を確認できます。',
      path: '/tools/regex-tester',
      category: 'テキスト',
      keywords: ['正規表現', 'regex', 'テスト', 'マッチング'],
    },
    {
      id: 'markdown-preview',
      name: 'Markdownプレビュー',
      description: 'MarkdownテキストをHTMLでプレビューします。',
      path: '/tools/markdown-preview',
      category: 'テキスト',
      keywords: ['markdown', 'プレビュー', 'html', 'テキスト'],
    },
    {
      id: 'css-minifier',
      name: 'CSS圧縮',
      description: 'CSSコードを圧縮してファイルサイズを削減します。',
      path: '/tools/css-minifier',
      category: 'Web開発',
      keywords: ['css', '圧縮', 'minify', 'ファイルサイズ'],
    },
    {
      id: 'js-minifier',
      name: 'JavaScript圧縮',
      description: 'JavaScriptコードを圧縮してファイルサイズを削減します。',
      path: '/tools/js-minifier',
      category: 'Web開発',
      keywords: ['javascript', 'js', '圧縮', 'minify'],
    },
    {
      id: 'html-encoder',
      name: 'HTMLエンティティエンコーダー',
      description: 'HTMLの特殊文字をエンティティ形式に変換します。',
      path: '/tools/html-encoder',
      category: 'Web開発',
      keywords: ['html', 'エンティティ', 'エンコード', '特殊文字'],
    },
    {
      id: 'image-omission',
      name: '画像省略ツール',
      description:
        '縦長・横長画像の指定部分を省略し、波線で省略を表現した画像を生成します。',
      path: '/tools/image-omission',
      category: 'デザイン',
      keywords: ['画像', '省略', '波線', '縦長', '横長', 'リサイズ', '編集'],
    },
    {
      id: 'image-resizer',
      name: '画像リサイズ',
      description: '画像のサイズを変更・リサイズします。',
      path: '/tools/image-resizer',
      category: 'デザイン',
      keywords: ['画像', 'リサイズ', 'サイズ変更', '縮小'],
    },
    {
      id: 'lorem-generator',
      name: 'Lorem Ipsum生成',
      description: 'ダミーテキスト（Lorem Ipsum）を生成します。',
      path: '/tools/lorem-generator',
      category: 'テキスト',
      keywords: ['lorem', 'ipsum', 'ダミーテキスト', '文章生成'],
    },
    {
      id: 'gradient-generator',
      name: 'CSS Gradient生成',
      description: 'CSSのgradientコードを視覚的に生成します。',
      path: '/tools/gradient-generator',
      category: 'デザイン',
      keywords: ['gradient', 'グラデーション', 'css', 'デザイン'],
    },
    {
      id: 'box-shadow-generator',
      name: 'Box Shadow生成',
      description: 'CSSのbox-shadowプロパティを視覚的に生成します。',
      path: '/tools/box-shadow-generator',
      category: 'デザイン',
      keywords: ['box-shadow', 'シャドウ', 'css', 'デザイン'],
    },
    {
      id: 'border-radius-generator',
      name: 'Border Radius生成',
      description: 'CSSのborder-radiusプロパティを視覚的に生成します。',
      path: '/tools/border-radius-generator',
      category: 'デザイン',
      keywords: ['border-radius', '角丸', 'css', 'デザイン'],
    },
    {
      id: 'csv-to-json',
      name: 'CSV to JSON変換',
      description: 'CSVデータをJSON形式に変換します。',
      path: '/tools/csv-to-json',
      category: 'データ変換',
      keywords: ['csv', 'json', '変換', 'データ'],
    },
    {
      id: 'json-to-csv',
      name: 'JSON to CSV変換',
      description: 'JSONデータをCSV形式に変換します。',
      path: '/tools/json-to-csv',
      category: 'データ変換',
      keywords: ['json', 'csv', '変換', 'データ'],
    },
    {
      id: 'diff-checker',
      name: 'テキスト差分チェッカー',
      description: '2つのテキストの差分を視覚的に表示します。',
      path: '/tools/diff-checker',
      category: 'テキスト',
      keywords: ['差分', 'diff', 'テキスト', '比較'],
    },
    {
      id: 'json-diff',
      name: 'JSON差分比較',
      description:
        '2つのJSONファイルの差分を視覚的に比較・分析します。追加・削除・変更された部分を詳細に表示し、レポート出力も可能です。',
      path: '/tools/json-diff',
      category: 'データ変換',
      keywords: [
        'JSON',
        '差分',
        '比較',
        'diff',
        'API',
        'データ分析',
        'オブジェクト',
        '構造比較',
      ],
    },
    {
      id: 'text-case-converter',
      name: 'テキスト形式変換',
      description: 'テキストを大文字・小文字・キャメルケースなどに変換します。',
      path: '/tools/text-case-converter',
      category: 'テキスト',
      keywords: ['テキスト', '大文字', '小文字', 'キャメルケース', '変換'],
    },
    {
      id: 'random-number-generator',
      name: '乱数生成',
      description: '指定した範囲内でランダムな数値を生成します。',
      path: '/tools/random-number-generator',
      category: '数学',
      keywords: ['乱数', 'ランダム', '数値', '生成'],
    },
    {
      id: 'prime-checker',
      name: '素数判定',
      description: '入力した数値が素数かどうかを判定します。',
      path: '/tools/prime-checker',
      category: '数学',
      keywords: ['素数', '判定', '数学', '計算'],
    },
    {
      id: 'fibonacci-generator',
      name: 'フィボナッチ数列生成',
      description: 'フィボナッチ数列を指定した項数まで生成します。',
      path: '/tools/fibonacci-generator',
      category: '数学',
      keywords: ['フィボナッチ', '数列', '数学', '生成'],
    },
    {
      id: 'factorial-calculator',
      name: '階乗計算',
      description: '指定した数値の階乗を計算します。',
      path: '/tools/factorial-calculator',
      category: '数学',
      keywords: ['階乗', '計算', '数学', 'factorial'],
    },
    {
      id: 'binary-calculator',
      name: '進数変換',
      description: '10進数、2進数、8進数、16進数を相互変換します。',
      path: '/tools/binary-calculator',
      category: '数学',
      keywords: ['進数', '変換', '2進数', '16進数', '8進数'],
    },
    {
      id: 'age-calculator',
      name: '年齢計算',
      description: '生年月日から現在の年齢を詳細に計算します。',
      path: '/tools/age-calculator',
      category: 'ユーティリティ',
      keywords: ['年齢', '計算', '生年月日', '日数'],
    },
    {
      id: 'stopwatch',
      name: 'ストップウォッチ',
      description: '高精度なストップウォッチ機能を提供します。',
      path: '/tools/stopwatch',
      category: 'ユーティリティ',
      keywords: ['ストップウォッチ', 'タイマー', '時間測定'],
    },
    {
      id: 'pomodoro-timer',
      name: 'ポモドーロタイマー',
      description: '作業効率向上のためのポモドーロテクニック用タイマーです。',
      path: '/tools/pomodoro-timer',
      category: 'ユーティリティ',
      keywords: ['ポモドーロ', 'タイマー', '作業効率', '集中'],
    },
    {
      id: 'expense-splitter',
      name: '割り勘計算',
      description: '複数人での飲み会などの費用を簡単に割り勘計算します。',
      path: '/tools/expense-splitter',
      category: '数学',
      keywords: ['割り勘', '計算', '費用', '分割'],
    },
    {
      id: 'tip-calculator',
      name: 'チップ計算',
      description: 'レストランなどでのチップ額を簡単に計算します。',
      path: '/tools/tip-calculator',
      category: '数学',
      keywords: ['チップ', '計算', 'レストラン', '金額'],
    },
    {
      id: 'mortgage-calculator',
      name: '住宅ローン計算',
      description: '住宅ローンの月額返済額や総返済額を計算します。',
      path: '/tools/mortgage-calculator',
      category: '数学',
      keywords: ['住宅ローン', '計算', '返済', '金利'],
    },
    {
      id: 'compound-interest-calculator',
      name: '複利計算',
      description: '複利での投資収益や貯蓄額を計算します。',
      path: '/tools/compound-interest-calculator',
      category: '数学',
      keywords: ['複利', '投資', '計算', '収益'],
    },
    {
      id: 'bmi-calculator',
      name: 'BMI計算',
      description: '身長と体重からBMI値を計算し、健康状態を判定します。',
      path: '/tools/bmi-calculator',
      category: 'ヘルス',
      keywords: ['bmi', '身長', '体重', '健康'],
    },
    {
      id: 'calorie-calculator',
      name: 'カロリー計算',
      description: '基礎代謝や必要カロリーを計算します。',
      path: '/tools/calorie-calculator',
      category: 'ヘルス',
      keywords: ['カロリー', '基礎代謝', '健康', '栄養'],
    },
    {
      id: 'water-intake-calculator',
      name: '水分摂取量計算',
      description: '体重や活動レベルから推奨水分摂取量を計算します。',
      path: '/tools/water-intake-calculator',
      category: 'ヘルス',
      keywords: ['水分', '摂取量', '健康', '体重'],
    },
    {
      id: 'world-clock',
      name: '世界時計',
      description: '世界各地の現在時刻を表示します。',
      path: '/tools/world-clock',
      category: 'ユーティリティ',
      keywords: ['世界時計', '時刻', 'タイムゾーン', '時差'],
    },
    {
      id: 'emoji-picker',
      name: '絵文字ピッカー',
      description: '豊富な絵文字から選択してコピーできます。',
      path: '/tools/emoji-picker',
      category: 'テキスト',
      keywords: ['絵文字', 'emoji', 'ピッカー', 'コピー'],
    },
    {
      id: 'credit-card-validator',
      name: 'クレジットカード番号検証',
      description:
        'クレジットカード番号の妥当性をLuhnアルゴリズムで検証します。',
      path: '/tools/credit-card-validator',
      category: 'セキュリティ',
      keywords: ['クレジットカード', '検証', 'luhn', 'バリデーション'],
    },
    {
      id: 'iban-validator',
      name: 'IBAN検証',
      description: '国際銀行口座番号（IBAN）の妥当性を検証します。',
      path: '/tools/iban-validator',
      category: 'セキュリティ',
      keywords: ['iban', '銀行', '口座番号', '検証'],
    },
    {
      id: 'image-to-base64',
      name: '画像をBase64変換',
      description: '画像ファイルをBase64エンコードされた文字列に変換します。',
      path: '/tools/image-to-base64',
      category: 'データ変換',
      keywords: ['画像', 'base64', '変換', 'エンコード'],
    },
    {
      id: 'meta-tag-generator',
      name: 'メタタグ生成',
      description: 'SEO用のメタタグを簡単に生成します。',
      path: '/tools/meta-tag-generator',
      category: 'Web開発',
      keywords: ['メタタグ', 'seo', 'html', 'meta'],
    },
    {
      id: 'robots-txt-generator',
      name: 'robots.txt生成',
      description: 'Webサイト用のrobots.txtファイルを生成します。',
      path: '/tools/robots-txt-generator',
      category: 'Web開発',
      keywords: ['robots.txt', 'seo', 'クローラー', 'ウェブサイト'],
    },
    {
      id: 'htaccess-generator',
      name: '.htaccess生成',
      description: 'Apache用の.htaccessファイルを簡単に生成します。',
      path: '/tools/htaccess-generator',
      category: 'Web開発',
      keywords: ['htaccess', 'apache', 'リダイレクト', 'セキュリティ'],
    },
    {
      id: 'sql-formatter',
      name: 'SQL整形',
      description: 'SQLクエリを見やすく整形します。',
      path: '/tools/sql-formatter',
      category: 'データベース',
      keywords: ['sql', '整形', 'フォーマット', 'クエリ'],
    },
    {
      id: 'cron-expression-generator',
      name: 'Cron式生成',
      description: 'Cronジョブの実行スケジュールを視覚的に設定します。',
      path: '/tools/cron-expression-generator',
      category: 'Web開発',
      keywords: ['cron', 'スケジュール', 'ジョブ', '設定'],
    },
    {
      id: 'email-validator',
      name: 'メールアドレス検証・フォーマット',
      description:
        'メールアドレスの形式検証、正規化、一括処理を行います。重複検出やCSV出力にも対応。',
      path: '/tools/email-validator',
      category: 'セキュリティ',
      keywords: [
        'メール検証',
        'メールアドレス',
        'バリデーション',
        '正規化',
        '一括処理',
        'CSV出力',
        '重複検出',
      ],
    },
  ]

  // 実装済みのツールのみをフィルタリングする
  const tools = allTools.filter(tool => implementedTools.has(tool.id))

  const getAllTools = () => tools

  const getToolById = (id: string) => tools.find(tool => tool.id === id)

  const getToolsByCategory = (category: string) =>
    tools.filter(tool => tool.category === category)

  const getCategories = () => [...new Set(tools.map(tool => tool.category))]

  const searchTools = (query: string) => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return tools.filter(
      tool =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.keywords.some(keyword =>
          keyword.toLowerCase().includes(lowerQuery)
        )
    )
  }

  return {
    tools,
    getAllTools,
    getToolById,
    getToolsByCategory,
    getCategories,
    searchTools,
  }
}
