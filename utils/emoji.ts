export interface EmojiCategory {
  id: string
  name: string
  icon: string
  emojis: Emoji[]
}

export interface Emoji {
  emoji: string
  name: string
  keywords: string[]
  shortcodes: string[]
}

// Most commonly used emojis organized by category
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: '顔・感情',
    icon: '😀',
    emojis: [
      {
        emoji: '😀',
        name: 'にっこり顔',
        keywords: ['笑顔', '嬉しい'],
        shortcodes: [':grinning:'],
      },
      {
        emoji: '😃',
        name: '大きな目の笑顔',
        keywords: ['笑顔', '嬉しい'],
        shortcodes: [':smiley:'],
      },
      {
        emoji: '😄',
        name: '目を細めて笑う顔',
        keywords: ['笑顔', '嬉しい'],
        shortcodes: [':smile:'],
      },
      {
        emoji: '😁',
        name: '歯を見せて笑う顔',
        keywords: ['笑顔', '嬉しい'],
        shortcodes: [':grin:'],
      },
      {
        emoji: '😆',
        name: '目を閉じて笑う顔',
        keywords: ['笑顔', '嬉しい'],
        shortcodes: [':laughing:'],
      },
      {
        emoji: '😅',
        name: '冷や汗で笑う顔',
        keywords: ['笑顔', '困惑'],
        shortcodes: [':sweat_smile:'],
      },
      {
        emoji: '😂',
        name: '喜びの涙',
        keywords: ['笑い', '嬉しい'],
        shortcodes: [':joy:'],
      },
      {
        emoji: '🤣',
        name: '転げ回って笑う',
        keywords: ['笑い', '嬉しい'],
        shortcodes: [':rofl:'],
      },
      {
        emoji: '😊',
        name: '幸せそうな顔',
        keywords: ['笑顔', '幸せ'],
        shortcodes: [':blush:'],
      },
      {
        emoji: '😇',
        name: '天使のような笑顔',
        keywords: ['天使', '善良'],
        shortcodes: [':innocent:'],
      },
      {
        emoji: '🙂',
        name: 'ほのかに笑う顔',
        keywords: ['笑顔', '穏やか'],
        shortcodes: [':slightly_smiling_face:'],
      },
      {
        emoji: '🙃',
        name: '逆さまの顔',
        keywords: ['おかしい', '困惑'],
        shortcodes: [':upside_down_face:'],
      },
      {
        emoji: '😉',
        name: 'ウィンクする顔',
        keywords: ['ウィンク', '合図'],
        shortcodes: [':wink:'],
      },
      {
        emoji: '😌',
        name: '安堵の表情',
        keywords: ['安心', '穏やか'],
        shortcodes: [':relieved:'],
      },
      {
        emoji: '😍',
        name: 'ハートの目をした笑顔',
        keywords: ['恋愛', '好き'],
        shortcodes: [':heart_eyes:'],
      },
      {
        emoji: '🥰',
        name: 'ハートに囲まれた笑顔',
        keywords: ['恋愛', '愛'],
        shortcodes: [':smiling_face_with_hearts:'],
      },
      {
        emoji: '😘',
        name: 'キスを送る顔',
        keywords: ['キス', '愛'],
        shortcodes: [':kissing_heart:'],
      },
      {
        emoji: '😗',
        name: 'キスする顔',
        keywords: ['キス'],
        shortcodes: [':kissing:'],
      },
      {
        emoji: '😙',
        name: '目を細めてキスする顔',
        keywords: ['キス'],
        shortcodes: [':kissing_smiling_eyes:'],
      },
      {
        emoji: '😚',
        name: '目を閉じてキスする顔',
        keywords: ['キス'],
        shortcodes: [':kissing_closed_eyes:'],
      },
      {
        emoji: '😋',
        name: '美味しそうな顔',
        keywords: ['美味しい', '食べ物'],
        shortcodes: [':yum:'],
      },
      {
        emoji: '😛',
        name: '舌を出した顔',
        keywords: ['いたずら', '舌'],
        shortcodes: [':stuck_out_tongue:'],
      },
      {
        emoji: '😜',
        name: 'ウィンクして舌を出した顔',
        keywords: ['いたずら', 'ウィンク'],
        shortcodes: [':stuck_out_tongue_winking_eye:'],
      },
      {
        emoji: '🤪',
        name: '変な顔',
        keywords: ['おかしい', '変'],
        shortcodes: [':zany_face:'],
      },
      {
        emoji: '😝',
        name: '目を閉じて舌を出した顔',
        keywords: ['いたずら'],
        shortcodes: [':stuck_out_tongue_closed_eyes:'],
      },
      {
        emoji: '🤑',
        name: 'お金の目をした顔',
        keywords: ['お金', '欲張り'],
        shortcodes: [':money_mouth_face:'],
      },
      {
        emoji: '🤗',
        name: 'ハグする顔',
        keywords: ['ハグ', '愛'],
        shortcodes: [':hugs:'],
      },
      {
        emoji: '🤭',
        name: '手で口を覆った顔',
        keywords: ['秘密', '恥ずかしい'],
        shortcodes: [':hand_over_mouth:'],
      },
      {
        emoji: '🤫',
        name: '静かにする顔',
        keywords: ['静か', '秘密'],
        shortcodes: [':shushing_face:'],
      },
      {
        emoji: '🤔',
        name: '考えている顔',
        keywords: ['考える', '思考'],
        shortcodes: [':thinking:'],
      },
      {
        emoji: '🤐',
        name: '口にファスナーのある顔',
        keywords: ['静か', '秘密'],
        shortcodes: [':zipper_mouth_face:'],
      },
      {
        emoji: '🤨',
        name: '眉を上げた顔',
        keywords: ['疑問', '不審'],
        shortcodes: [':raised_eyebrow:'],
      },
      {
        emoji: '😐',
        name: '無表情',
        keywords: ['無表情', 'つまらない'],
        shortcodes: [':neutral_face:'],
      },
      {
        emoji: '😑',
        name: '無気力な顔',
        keywords: ['無気力', 'つまらない'],
        shortcodes: [':expressionless:'],
      },
      {
        emoji: '😶',
        name: '口のない顔',
        keywords: ['無言', '静か'],
        shortcodes: [':no_mouth:'],
      },
      {
        emoji: '😏',
        name: 'にやりとした顔',
        keywords: ['にやり', 'いたずら'],
        shortcodes: [':smirk:'],
      },
      {
        emoji: '😒',
        name: 'つまらなそうな顔',
        keywords: ['つまらない', '退屈'],
        shortcodes: [':unamused:'],
      },
      {
        emoji: '🙄',
        name: '目を回した顔',
        keywords: ['呆れ', 'うんざり'],
        shortcodes: [':roll_eyes:'],
      },
      {
        emoji: '😬',
        name: '歯を食いしばった顔',
        keywords: ['緊張', '困惑'],
        shortcodes: [':grimacing:'],
      },
      {
        emoji: '🤥',
        name: '嘘つきの顔',
        keywords: ['嘘', 'うそ'],
        shortcodes: [':lying_face:'],
      },
      {
        emoji: '😔',
        name: '落ち込んだ顔',
        keywords: ['悲しい', '落ち込む'],
        shortcodes: [':pensive:'],
      },
      {
        emoji: '😕',
        name: '困惑した顔',
        keywords: ['困惑', '悩み'],
        shortcodes: [':confused:'],
      },
      {
        emoji: '🙁',
        name: 'わずかにしかめた顔',
        keywords: ['悲しい', '困惑'],
        shortcodes: [':slightly_frowning_face:'],
      },
      {
        emoji: '☹️',
        name: 'しかめた顔',
        keywords: ['悲しい', '不満'],
        shortcodes: [':frowning_face:'],
      },
      {
        emoji: '😣',
        name: '忍耐の顔',
        keywords: ['忍耐', '努力'],
        shortcodes: [':persevere:'],
      },
      {
        emoji: '😖',
        name: '困惑した顔',
        keywords: ['困惑', '悩み'],
        shortcodes: [':confounded:'],
      },
      {
        emoji: '😫',
        name: '疲れ果てた顔',
        keywords: ['疲れ', 'うんざり'],
        shortcodes: [':tired_face:'],
      },
      {
        emoji: '😩',
        name: '疲れた顔',
        keywords: ['疲れ', 'ストレス'],
        shortcodes: [':weary:'],
      },
      {
        emoji: '😤',
        name: '鼻息の荒い顔',
        keywords: ['怒り', 'イライラ'],
        shortcodes: [':triumph:'],
      },
      {
        emoji: '😠',
        name: '怒った顔',
        keywords: ['怒り', 'イライラ'],
        shortcodes: [':angry:'],
      },
      {
        emoji: '😡',
        name: '真っ赤になって怒った顔',
        keywords: ['怒り', '激怒'],
        shortcodes: [':rage:'],
      },
      {
        emoji: '🤬',
        name: 'F爆弾のような顔',
        keywords: ['怒り', '悪口'],
        shortcodes: [':face_with_symbols_over_mouth:'],
      },
      {
        emoji: '🥵',
        name: '暑い顔',
        keywords: ['暑い', '熱'],
        shortcodes: [':hot_face:'],
      },
      {
        emoji: '🥶',
        name: '寒い顔',
        keywords: ['寒い', '冷たい'],
        shortcodes: [':cold_face:'],
      },
      {
        emoji: '😱',
        name: '恐怖で叫ぶ顔',
        keywords: ['恐怖', 'びっくり'],
        shortcodes: [':scream:'],
      },
      {
        emoji: '😨',
        name: '恐ろしい顔',
        keywords: ['恐怖', '心配'],
        shortcodes: [':fearful:'],
      },
      {
        emoji: '😰',
        name: '不安で冷や汗をかく顔',
        keywords: ['不安', '心配'],
        shortcodes: [':cold_sweat:'],
      },
      {
        emoji: '😥',
        name: '落胆して汗をかく顔',
        keywords: ['落胆', '悲しい'],
        shortcodes: [':disappointed_relieved:'],
      },
      {
        emoji: '😢',
        name: '泣く顔',
        keywords: ['泣く', '悲しい'],
        shortcodes: [':cry:'],
      },
      {
        emoji: '😭',
        name: '号泣する顔',
        keywords: ['泣く', '悲しい'],
        shortcodes: [':sob:'],
      },
      {
        emoji: '😪',
        name: '眠い顔',
        keywords: ['眠い', '疲れ'],
        shortcodes: [':sleepy:'],
      },
      {
        emoji: '😴',
        name: '眠る顔',
        keywords: ['眠る', '睡眠'],
        shortcodes: [':sleeping:'],
      },
    ],
  },
  {
    id: 'people',
    name: '人・体',
    icon: '👤',
    emojis: [
      {
        emoji: '👋',
        name: '手を振る',
        keywords: ['挨拶', 'こんにちは'],
        shortcodes: [':wave:'],
      },
      {
        emoji: '🤚',
        name: '手の甲を上げる',
        keywords: ['手', '止まれ'],
        shortcodes: [':raised_back_of_hand:'],
      },
      {
        emoji: '🖐️',
        name: '手',
        keywords: ['手', '5'],
        shortcodes: [':raised_hand_with_fingers_splayed:'],
      },
      {
        emoji: '✋',
        name: '上げた手',
        keywords: ['手', '止まれ'],
        shortcodes: [':raised_hand:'],
      },
      {
        emoji: '🖖',
        name: 'バルカンの挨拶',
        keywords: ['スタートレック', '挨拶'],
        shortcodes: [':vulcan_salute:'],
      },
      {
        emoji: '👌',
        name: 'OKサイン',
        keywords: ['OK', '良い'],
        shortcodes: [':ok_hand:'],
      },
      {
        emoji: '🤏',
        name: '少しつまむ',
        keywords: ['少し', 'つまむ'],
        shortcodes: [':pinching_hand:'],
      },
      {
        emoji: '✌️',
        name: 'ピースサイン',
        keywords: ['ピース', '勝利'],
        shortcodes: [':victory_hand:'],
      },
      {
        emoji: '🤞',
        name: '指を交差',
        keywords: ['祈り', '幸運'],
        shortcodes: [':crossed_fingers:'],
      },
      {
        emoji: '🤟',
        name: 'アイラブユー',
        keywords: ['愛', '手話'],
        shortcodes: [':love_you_gesture:'],
      },
      {
        emoji: '🤘',
        name: 'ロックのサイン',
        keywords: ['ロック', '音楽'],
        shortcodes: [':metal:'],
      },
      {
        emoji: '🤙',
        name: 'コールミー',
        keywords: ['電話', '連絡'],
        shortcodes: [':call_me_hand:'],
      },
      {
        emoji: '👈',
        name: '左を指す',
        keywords: ['左', '指差し'],
        shortcodes: [':point_left:'],
      },
      {
        emoji: '👉',
        name: '右を指す',
        keywords: ['右', '指差し'],
        shortcodes: [':point_right:'],
      },
      {
        emoji: '👆',
        name: '上を指す',
        keywords: ['上', '指差し'],
        shortcodes: [':point_up_2:'],
      },
      {
        emoji: '🖕',
        name: '中指',
        keywords: ['侮辱', '怒り'],
        shortcodes: [':middle_finger:'],
      },
      {
        emoji: '👇',
        name: '下を指す',
        keywords: ['下', '指差し'],
        shortcodes: [':point_down:'],
      },
      {
        emoji: '☝️',
        name: '人差し指を上げる',
        keywords: ['指差し', '注意'],
        shortcodes: [':point_up:'],
      },
      {
        emoji: '👍',
        name: 'サムズアップ',
        keywords: ['良い', '賛成'],
        shortcodes: [':thumbsup:', ':+1:'],
      },
      {
        emoji: '👎',
        name: 'サムズダウン',
        keywords: ['悪い', '反対'],
        shortcodes: [':thumbsdown:', ':-1:'],
      },
      {
        emoji: '✊',
        name: '握りこぶし',
        keywords: ['拳', '力'],
        shortcodes: [':fist:'],
      },
      {
        emoji: '👊',
        name: 'こぶしパンチ',
        keywords: ['パンチ', '力'],
        shortcodes: [':punch:'],
      },
      {
        emoji: '🤛',
        name: '左こぶし',
        keywords: ['こぶし', 'パンチ'],
        shortcodes: [':left_facing_fist:'],
      },
      {
        emoji: '🤜',
        name: '右こぶし',
        keywords: ['こぶし', 'パンチ'],
        shortcodes: [':right_facing_fist:'],
      },
      {
        emoji: '👏',
        name: '拍手',
        keywords: ['拍手', '称賛'],
        shortcodes: [':clap:'],
      },
      {
        emoji: '🙌',
        name: '万歳',
        keywords: ['万歳', '祝福'],
        shortcodes: [':raised_hands:'],
      },
      {
        emoji: '👐',
        name: '開いた手',
        keywords: ['手', 'ハグ'],
        shortcodes: [':open_hands:'],
      },
      {
        emoji: '🤲',
        name: '手のひらを上に',
        keywords: ['お祈り', 'お願い'],
        shortcodes: [':palms_up_together:'],
      },
      {
        emoji: '🤝',
        name: '握手',
        keywords: ['握手', '合意'],
        shortcodes: [':handshake:'],
      },
      {
        emoji: '🙏',
        name: '祈り',
        keywords: ['祈り', 'お願い'],
        shortcodes: [':pray:'],
      },
      {
        emoji: '✍️',
        name: '書く手',
        keywords: ['書く', 'ペン'],
        shortcodes: [':writing_hand:'],
      },
      {
        emoji: '💅',
        name: 'ネイル',
        keywords: ['ネイル', '爪'],
        shortcodes: [':nail_care:'],
      },
      {
        emoji: '🤳',
        name: 'セルフィー',
        keywords: ['自撮り', '写真'],
        shortcodes: [':selfie:'],
      },
      {
        emoji: '💪',
        name: '上腕二頭筋',
        keywords: ['筋肉', '力'],
        shortcodes: [':muscle:'],
      },
      {
        emoji: '🦾',
        name: '機械の腕',
        keywords: ['ロボット', '義手'],
        shortcodes: [':mechanical_arm:'],
      },
      {
        emoji: '🦿',
        name: '機械の足',
        keywords: ['ロボット', '義足'],
        shortcodes: [':mechanical_leg:'],
      },
      {
        emoji: '🦵',
        name: '足',
        keywords: ['足', '脚'],
        shortcodes: [':leg:'],
      },
      {
        emoji: '🦶',
        name: '足',
        keywords: ['足', 'つま先'],
        shortcodes: [':foot:'],
      },
      {
        emoji: '👂',
        name: '耳',
        keywords: ['耳', '聞く'],
        shortcodes: [':ear:'],
      },
      {
        emoji: '🦻',
        name: '補聴器の耳',
        keywords: ['補聴器', '聞く'],
        shortcodes: [':ear_with_hearing_aid:'],
      },
      {
        emoji: '👃',
        name: '鼻',
        keywords: ['鼻', '匂い'],
        shortcodes: [':nose:'],
      },
      {
        emoji: '🧠',
        name: '脳',
        keywords: ['脳', '頭'],
        shortcodes: [':brain:'],
      },
      {
        emoji: '🦷',
        name: '歯',
        keywords: ['歯', '歯科'],
        shortcodes: [':tooth:'],
      },
      {
        emoji: '🦴',
        name: '骨',
        keywords: ['骨', '犬'],
        shortcodes: [':bone:'],
      },
      {
        emoji: '👀',
        name: '目',
        keywords: ['目', '見る'],
        shortcodes: [':eyes:'],
      },
      {
        emoji: '👁️',
        name: '目',
        keywords: ['目', '見る'],
        shortcodes: [':eye:'],
      },
      {
        emoji: '👅',
        name: '舌',
        keywords: ['舌', '味'],
        shortcodes: [':tongue:'],
      },
      {
        emoji: '👄',
        name: '唇',
        keywords: ['唇', '口'],
        shortcodes: [':lips:'],
      },
    ],
  },
  {
    id: 'animals',
    name: '動物・自然',
    icon: '🐶',
    emojis: [
      {
        emoji: '🐶',
        name: '犬の顔',
        keywords: ['犬', 'ペット'],
        shortcodes: [':dog:'],
      },
      {
        emoji: '🐱',
        name: '猫の顔',
        keywords: ['猫', 'ペット'],
        shortcodes: [':cat:'],
      },
      {
        emoji: '🐭',
        name: 'ネズミの顔',
        keywords: ['ネズミ', '小動物'],
        shortcodes: [':mouse:'],
      },
      {
        emoji: '🐹',
        name: 'ハムスターの顔',
        keywords: ['ハムスター', 'ペット'],
        shortcodes: [':hamster:'],
      },
      {
        emoji: '🐰',
        name: 'ウサギの顔',
        keywords: ['ウサギ', 'ペット'],
        shortcodes: [':rabbit:'],
      },
      {
        emoji: '🦊',
        name: 'キツネの顔',
        keywords: ['キツネ', '野生動物'],
        shortcodes: [':fox_face:'],
      },
      {
        emoji: '🐻',
        name: 'クマの顔',
        keywords: ['クマ', '野生動物'],
        shortcodes: [':bear:'],
      },
      {
        emoji: '🐼',
        name: 'パンダの顔',
        keywords: ['パンダ', '中国'],
        shortcodes: [':panda_face:'],
      },
      {
        emoji: '🐨',
        name: 'コアラ',
        keywords: ['コアラ', 'オーストラリア'],
        shortcodes: [':koala:'],
      },
      {
        emoji: '🐯',
        name: 'トラの顔',
        keywords: ['トラ', '野生動物'],
        shortcodes: [':tiger:'],
      },
      {
        emoji: '🦁',
        name: 'ライオンの顔',
        keywords: ['ライオン', '野生動物'],
        shortcodes: [':lion:'],
      },
      {
        emoji: '🐮',
        name: '牛の顔',
        keywords: ['牛', '家畜'],
        shortcodes: [':cow:'],
      },
      {
        emoji: '🐷',
        name: '豚の顔',
        keywords: ['豚', '家畜'],
        shortcodes: [':pig:'],
      },
      {
        emoji: '🐽',
        name: '豚の鼻',
        keywords: ['豚', '鼻'],
        shortcodes: [':pig_nose:'],
      },
      {
        emoji: '🐸',
        name: 'カエルの顔',
        keywords: ['カエル', '両生類'],
        shortcodes: [':frog:'],
      },
      {
        emoji: '🐵',
        name: 'サルの顔',
        keywords: ['サル', '霊長類'],
        shortcodes: [':monkey_face:'],
      },
      {
        emoji: '🙈',
        name: '見ざる',
        keywords: ['サル', '見ざる聞かざる言わざる'],
        shortcodes: [':see_no_evil:'],
      },
      {
        emoji: '🙉',
        name: '聞かざる',
        keywords: ['サル', '見ざる聞かざる言わざる'],
        shortcodes: [':hear_no_evil:'],
      },
      {
        emoji: '🙊',
        name: '言わざる',
        keywords: ['サル', '見ざる聞かざる言わざる'],
        shortcodes: [':speak_no_evil:'],
      },
      {
        emoji: '🐒',
        name: 'サル',
        keywords: ['サル', '霊長類'],
        shortcodes: [':monkey:'],
      },
      {
        emoji: '🦍',
        name: 'ゴリラ',
        keywords: ['ゴリラ', '霊長類'],
        shortcodes: [':gorilla:'],
      },
      {
        emoji: '🦧',
        name: 'オランウータン',
        keywords: ['オランウータン', '霊長類'],
        shortcodes: [':orangutan:'],
      },
      {
        emoji: '🐕',
        name: '犬',
        keywords: ['犬', 'ペット'],
        shortcodes: [':dog2:'],
      },
      {
        emoji: '🐩',
        name: 'プードル',
        keywords: ['プードル', '犬'],
        shortcodes: [':poodle:'],
      },
      {
        emoji: '🦮',
        name: '盲導犬',
        keywords: ['盲導犬', '介助'],
        shortcodes: [':guide_dog:'],
      },
      {
        emoji: '🐕‍🦺',
        name: '介助犬',
        keywords: ['介助犬', 'サービス'],
        shortcodes: [':service_dog:'],
      },
      {
        emoji: '🐈',
        name: '猫',
        keywords: ['猫', 'ペット'],
        shortcodes: [':cat2:'],
      },
      {
        emoji: '🐈‍⬛',
        name: '黒猫',
        keywords: ['黒猫', '猫'],
        shortcodes: [':black_cat:'],
      },
      {
        emoji: '🐅',
        name: 'トラ',
        keywords: ['トラ', '野生動物'],
        shortcodes: [':tiger2:'],
      },
      {
        emoji: '🐆',
        name: 'ヒョウ',
        keywords: ['ヒョウ', '野生動物'],
        shortcodes: [':leopard:'],
      },
      {
        emoji: '🐴',
        name: '馬の顔',
        keywords: ['馬', '動物'],
        shortcodes: [':horse:'],
      },
      {
        emoji: '🐎',
        name: '馬',
        keywords: ['馬', '競馬'],
        shortcodes: [':racehorse:'],
      },
      {
        emoji: '🦄',
        name: 'ユニコーン',
        keywords: ['ユニコーン', '幻想'],
        shortcodes: [':unicorn:'],
      },
      {
        emoji: '🦓',
        name: 'シマウマ',
        keywords: ['シマウマ', '野生動物'],
        shortcodes: [':zebra:'],
      },
      {
        emoji: '🦌',
        name: '鹿',
        keywords: ['鹿', '野生動物'],
        shortcodes: [':deer:'],
      },
      {
        emoji: '🐄',
        name: '牛',
        keywords: ['牛', '家畜'],
        shortcodes: [':cow2:'],
      },
      {
        emoji: '🐂',
        name: '雄牛',
        keywords: ['雄牛', '強い'],
        shortcodes: [':ox:'],
      },
      {
        emoji: '🐃',
        name: '水牛',
        keywords: ['水牛', '野生動物'],
        shortcodes: [':water_buffalo:'],
      },
      {
        emoji: '🐖',
        name: '豚',
        keywords: ['豚', '家畜'],
        shortcodes: [':pig2:'],
      },
      {
        emoji: '🐗',
        name: 'イノシシ',
        keywords: ['イノシシ', '野生動物'],
        shortcodes: [':boar:'],
      },
      {
        emoji: '🐏',
        name: '羊',
        keywords: ['羊', '家畜'],
        shortcodes: [':ram:'],
      },
      {
        emoji: '🐑',
        name: 'ヒツジ',
        keywords: ['ヒツジ', '家畜'],
        shortcodes: [':sheep:'],
      },
      {
        emoji: '🐐',
        name: 'ヤギ',
        keywords: ['ヤギ', '家畜'],
        shortcodes: [':goat:'],
      },
      {
        emoji: '🐪',
        name: 'ラクダ',
        keywords: ['ラクダ', '砂漠'],
        shortcodes: [':dromedary_camel:'],
      },
      {
        emoji: '🐫',
        name: 'フタコブラクダ',
        keywords: ['ラクダ', '砂漠'],
        shortcodes: [':camel:'],
      },
      {
        emoji: '🦙',
        name: 'ラマ',
        keywords: ['ラマ', '南米'],
        shortcodes: [':llama:'],
      },
      {
        emoji: '🦒',
        name: 'キリン',
        keywords: ['キリン', 'アフリカ'],
        shortcodes: [':giraffe:'],
      },
      {
        emoji: '🐘',
        name: 'ゾウ',
        keywords: ['ゾウ', '大きい'],
        shortcodes: [':elephant:'],
      },
      {
        emoji: '🦏',
        name: 'サイ',
        keywords: ['サイ', '野生動物'],
        shortcodes: [':rhinoceros:'],
      },
      {
        emoji: '🦛',
        name: 'カバ',
        keywords: ['カバ', 'アフリカ'],
        shortcodes: [':hippopotamus:'],
      },
      {
        emoji: '🐁',
        name: 'ネズミ',
        keywords: ['ネズミ', '小動物'],
        shortcodes: [':mouse2:'],
      },
      {
        emoji: '🐀',
        name: 'ドブネズミ',
        keywords: ['ネズミ', 'ドブネズミ'],
        shortcodes: [':rat:'],
      },
      {
        emoji: '🐿️',
        name: 'リス',
        keywords: ['リス', '小動物'],
        shortcodes: [':chipmunk:'],
      },
      {
        emoji: '🦔',
        name: 'ハリネズミ',
        keywords: ['ハリネズミ', '小動物'],
        shortcodes: [':hedgehog:'],
      },
    ],
  },
  {
    id: 'food',
    name: '食べ物・飲み物',
    icon: '🍎',
    emojis: [
      {
        emoji: '🍎',
        name: '赤いリンゴ',
        keywords: ['リンゴ', '果物'],
        shortcodes: [':apple:'],
      },
      {
        emoji: '🍏',
        name: '青いリンゴ',
        keywords: ['リンゴ', '果物'],
        shortcodes: [':green_apple:'],
      },
      {
        emoji: '🍊',
        name: 'オレンジ',
        keywords: ['オレンジ', '果物'],
        shortcodes: [':tangerine:'],
      },
      {
        emoji: '🍋',
        name: 'レモン',
        keywords: ['レモン', '果物'],
        shortcodes: [':lemon:'],
      },
      {
        emoji: '🍌',
        name: 'バナナ',
        keywords: ['バナナ', '果物'],
        shortcodes: [':banana:'],
      },
      {
        emoji: '🍉',
        name: 'スイカ',
        keywords: ['スイカ', '果物'],
        shortcodes: [':watermelon:'],
      },
      {
        emoji: '🍇',
        name: 'ぶどう',
        keywords: ['ぶどう', '果物'],
        shortcodes: [':grapes:'],
      },
      {
        emoji: '🍓',
        name: 'イチゴ',
        keywords: ['イチゴ', '果物'],
        shortcodes: [':strawberry:'],
      },
      {
        emoji: '🫐',
        name: 'ブルーベリー',
        keywords: ['ブルーベリー', '果物'],
        shortcodes: [':blueberries:'],
      },
      {
        emoji: '🍈',
        name: 'メロン',
        keywords: ['メロン', '果物'],
        shortcodes: [':melon:'],
      },
      {
        emoji: '🍒',
        name: 'さくらんぼ',
        keywords: ['さくらんぼ', '果物'],
        shortcodes: [':cherries:'],
      },
      {
        emoji: '🍑',
        name: '桃',
        keywords: ['桃', '果物'],
        shortcodes: [':peach:'],
      },
      {
        emoji: '🥭',
        name: 'マンゴー',
        keywords: ['マンゴー', '果物'],
        shortcodes: [':mango:'],
      },
      {
        emoji: '🍍',
        name: 'パイナップル',
        keywords: ['パイナップル', '果物'],
        shortcodes: [':pineapple:'],
      },
      {
        emoji: '🥥',
        name: 'ココナッツ',
        keywords: ['ココナッツ', '果物'],
        shortcodes: [':coconut:'],
      },
      {
        emoji: '🥝',
        name: 'キウイ',
        keywords: ['キウイ', '果物'],
        shortcodes: [':kiwi_fruit:'],
      },
      {
        emoji: '🍅',
        name: 'トマト',
        keywords: ['トマト', '野菜'],
        shortcodes: [':tomato:'],
      },
      {
        emoji: '🍆',
        name: 'ナス',
        keywords: ['ナス', '野菜'],
        shortcodes: [':eggplant:'],
      },
      {
        emoji: '🥑',
        name: 'アボカド',
        keywords: ['アボカド', '野菜'],
        shortcodes: [':avocado:'],
      },
      {
        emoji: '🥦',
        name: 'ブロッコリー',
        keywords: ['ブロッコリー', '野菜'],
        shortcodes: [':broccoli:'],
      },
      {
        emoji: '🥬',
        name: 'レタス',
        keywords: ['レタス', '野菜'],
        shortcodes: [':leafy_greens:'],
      },
      {
        emoji: '🥒',
        name: 'キュウリ',
        keywords: ['キュウリ', '野菜'],
        shortcodes: [':cucumber:'],
      },
      {
        emoji: '🌶️',
        name: '唐辛子',
        keywords: ['唐辛子', '辛い'],
        shortcodes: [':hot_pepper:'],
      },
      {
        emoji: '🫑',
        name: 'ピーマン',
        keywords: ['ピーマン', '野菜'],
        shortcodes: [':bell_pepper:'],
      },
      {
        emoji: '🌽',
        name: 'トウモロコシ',
        keywords: ['トウモロコシ', '野菜'],
        shortcodes: [':corn:'],
      },
      {
        emoji: '🥕',
        name: 'ニンジン',
        keywords: ['ニンジン', '野菜'],
        shortcodes: [':carrot:'],
      },
      {
        emoji: '🫒',
        name: 'オリーブ',
        keywords: ['オリーブ', '果物'],
        shortcodes: [':olive:'],
      },
      {
        emoji: '🧄',
        name: 'ニンニク',
        keywords: ['ニンニク', '野菜'],
        shortcodes: [':garlic:'],
      },
      {
        emoji: '🧅',
        name: 'タマネギ',
        keywords: ['タマネギ', '野菜'],
        shortcodes: [':onion:'],
      },
      {
        emoji: '🥔',
        name: 'ジャガイモ',
        keywords: ['ジャガイモ', '野菜'],
        shortcodes: [':potato:'],
      },
      {
        emoji: '🍠',
        name: 'サツマイモ',
        keywords: ['サツマイモ', '野菜'],
        shortcodes: [':sweet_potato:'],
      },
      {
        emoji: '🥐',
        name: 'クロワッサン',
        keywords: ['クロワッサン', 'パン'],
        shortcodes: [':croissant:'],
      },
      {
        emoji: '🥖',
        name: 'フランスパン',
        keywords: ['フランスパン', 'パン'],
        shortcodes: [':baguette_bread:'],
      },
      {
        emoji: '🍞',
        name: 'パン',
        keywords: ['パン', '食パン'],
        shortcodes: [':bread:'],
      },
      {
        emoji: '🥨',
        name: 'プレッツェル',
        keywords: ['プレッツェル', 'パン'],
        shortcodes: [':pretzel:'],
      },
      {
        emoji: '🥯',
        name: 'ベーグル',
        keywords: ['ベーグル', 'パン'],
        shortcodes: [':bagel:'],
      },
      {
        emoji: '🥞',
        name: 'パンケーキ',
        keywords: ['パンケーキ', 'デザート'],
        shortcodes: [':pancakes:'],
      },
      {
        emoji: '🧇',
        name: 'ワッフル',
        keywords: ['ワッフル', 'デザート'],
        shortcodes: [':waffle:'],
      },
      {
        emoji: '🧀',
        name: 'チーズ',
        keywords: ['チーズ', '乳製品'],
        shortcodes: [':cheese:'],
      },
      {
        emoji: '🍖',
        name: '骨付き肉',
        keywords: ['肉', '食べ物'],
        shortcodes: [':meat_on_bone:'],
      },
      {
        emoji: '🍗',
        name: '鶏もも肉',
        keywords: ['鶏肉', '食べ物'],
        shortcodes: [':poultry_leg:'],
      },
      {
        emoji: '🥩',
        name: 'ステーキ',
        keywords: ['ステーキ', '肉'],
        shortcodes: [':cut_of_meat:'],
      },
      {
        emoji: '🥓',
        name: 'ベーコン',
        keywords: ['ベーコン', '肉'],
        shortcodes: [':bacon:'],
      },
      {
        emoji: '🍔',
        name: 'ハンバーガー',
        keywords: ['ハンバーガー', 'ファーストフード'],
        shortcodes: [':hamburger:'],
      },
      {
        emoji: '🍟',
        name: 'フライドポテト',
        keywords: ['フライドポテト', 'ファーストフード'],
        shortcodes: [':fries:'],
      },
      {
        emoji: '🍕',
        name: 'ピザ',
        keywords: ['ピザ', 'イタリアン'],
        shortcodes: [':pizza:'],
      },
      {
        emoji: '🌭',
        name: 'ホットドッグ',
        keywords: ['ホットドッグ', 'ファーストフード'],
        shortcodes: [':hotdog:'],
      },
      {
        emoji: '🥪',
        name: 'サンドイッチ',
        keywords: ['サンドイッチ', '軽食'],
        shortcodes: [':sandwich:'],
      },
      {
        emoji: '🌮',
        name: 'タコス',
        keywords: ['タコス', 'メキシカン'],
        shortcodes: [':taco:'],
      },
      {
        emoji: '🌯',
        name: 'ブリトー',
        keywords: ['ブリトー', 'メキシカン'],
        shortcodes: [':burrito:'],
      },
      {
        emoji: '🫔',
        name: 'タマレ',
        keywords: ['タマレ', 'メキシカン'],
        shortcodes: [':tamale:'],
      },
      {
        emoji: '🥙',
        name: 'ファラフェル',
        keywords: ['ファラフェル', '中東'],
        shortcodes: [':stuffed_flatbread:'],
      },
      {
        emoji: '🧆',
        name: 'ファラフェル',
        keywords: ['ファラフェル', '中東'],
        shortcodes: [':falafel:'],
      },
      {
        emoji: '🥚',
        name: '卵',
        keywords: ['卵', '食材'],
        shortcodes: [':egg:'],
      },
      {
        emoji: '🍳',
        name: '目玉焼き',
        keywords: ['目玉焼き', '卵'],
        shortcodes: [':fried_egg:'],
      },
      {
        emoji: '🥘',
        name: 'パエリア',
        keywords: ['パエリア', 'スペイン'],
        shortcodes: [':shallow_pan_of_food:'],
      },
      {
        emoji: '🍲',
        name: '鍋料理',
        keywords: ['鍋', 'スープ'],
        shortcodes: [':stew:'],
      },
      {
        emoji: '🫕',
        name: 'フォンデュ',
        keywords: ['フォンデュ', 'チーズ'],
        shortcodes: [':fondue:'],
      },
      {
        emoji: '🥣',
        name: 'ボウル',
        keywords: ['ボウル', '器'],
        shortcodes: [':bowl_with_spoon:'],
      },
      {
        emoji: '🥗',
        name: 'サラダ',
        keywords: ['サラダ', 'ヘルシー'],
        shortcodes: [':green_salad:'],
      },
      {
        emoji: '🍿',
        name: 'ポップコーン',
        keywords: ['ポップコーン', 'スナック'],
        shortcodes: [':popcorn:'],
      },
      {
        emoji: '🧈',
        name: 'バター',
        keywords: ['バター', '乳製品'],
        shortcodes: [':butter:'],
      },
      {
        emoji: '🧂',
        name: '塩',
        keywords: ['塩', '調味料'],
        shortcodes: [':salt:'],
      },
      {
        emoji: '🥫',
        name: '缶詰',
        keywords: ['缶詰', '保存食'],
        shortcodes: [':canned_food:'],
      },
    ],
  },
  {
    id: 'activities',
    name: '活動・スポーツ',
    icon: '⚽',
    emojis: [
      {
        emoji: '⚽',
        name: 'サッカーボール',
        keywords: ['サッカー', 'スポーツ'],
        shortcodes: [':soccer:'],
      },
      {
        emoji: '🏀',
        name: 'バスケットボール',
        keywords: ['バスケ', 'スポーツ'],
        shortcodes: [':basketball:'],
      },
      {
        emoji: '🏈',
        name: 'アメフトボール',
        keywords: ['アメフト', 'スポーツ'],
        shortcodes: [':football:'],
      },
      {
        emoji: '⚾',
        name: '野球ボール',
        keywords: ['野球', 'スポーツ'],
        shortcodes: [':baseball:'],
      },
      {
        emoji: '🥎',
        name: 'ソフトボール',
        keywords: ['ソフトボール', 'スポーツ'],
        shortcodes: [':softball:'],
      },
      {
        emoji: '🎾',
        name: 'テニスボール',
        keywords: ['テニス', 'スポーツ'],
        shortcodes: [':tennis:'],
      },
      {
        emoji: '🏐',
        name: 'バレーボール',
        keywords: ['バレー', 'スポーツ'],
        shortcodes: [':volleyball:'],
      },
      {
        emoji: '🏉',
        name: 'ラグビーボール',
        keywords: ['ラグビー', 'スポーツ'],
        shortcodes: [':rugby_football:'],
      },
      {
        emoji: '🥏',
        name: 'フリスビー',
        keywords: ['フリスビー', 'スポーツ'],
        shortcodes: [':flying_disc:'],
      },
      {
        emoji: '🎱',
        name: 'ビリヤード',
        keywords: ['ビリヤード', 'ゲーム'],
        shortcodes: [':8ball:'],
      },
      {
        emoji: '🪀',
        name: 'ヨーヨー',
        keywords: ['ヨーヨー', 'おもちゃ'],
        shortcodes: [':yo_yo:'],
      },
      {
        emoji: '🏓',
        name: '卓球',
        keywords: ['卓球', 'スポーツ'],
        shortcodes: [':ping_pong:'],
      },
      {
        emoji: '🏸',
        name: 'バドミントン',
        keywords: ['バドミントン', 'スポーツ'],
        shortcodes: [':badminton:'],
      },
      {
        emoji: '🏒',
        name: 'ホッケー',
        keywords: ['ホッケー', 'スポーツ'],
        shortcodes: [':hockey:'],
      },
      {
        emoji: '🥍',
        name: 'ラクロス',
        keywords: ['ラクロス', 'スポーツ'],
        shortcodes: [':lacrosse:'],
      },
      {
        emoji: '🏑',
        name: 'フィールドホッケー',
        keywords: ['フィールドホッケー', 'スポーツ'],
        shortcodes: [':field_hockey:'],
      },
      {
        emoji: '🥅',
        name: 'ゴール',
        keywords: ['ゴール', 'スポーツ'],
        shortcodes: [':goal_net:'],
      },
      {
        emoji: '⛳',
        name: 'ゴルフフラッグ',
        keywords: ['ゴルフ', 'スポーツ'],
        shortcodes: [':golf:'],
      },
      {
        emoji: '🪁',
        name: '凧',
        keywords: ['凧', '遊び'],
        shortcodes: [':kite:'],
      },
      {
        emoji: '🏹',
        name: '弓矢',
        keywords: ['弓矢', 'アーチェリー'],
        shortcodes: [':bow_and_arrow:'],
      },
      {
        emoji: '🎣',
        name: '釣り竿',
        keywords: ['釣り', 'アウトドア'],
        shortcodes: [':fishing_pole_and_fish:'],
      },
      {
        emoji: '🤿',
        name: 'ダイビングマスク',
        keywords: ['ダイビング', '海'],
        shortcodes: [':diving_mask:'],
      },
      {
        emoji: '🥊',
        name: 'ボクシンググローブ',
        keywords: ['ボクシング', 'スポーツ'],
        shortcodes: [':boxing_glove:'],
      },
      {
        emoji: '🥋',
        name: '武道着',
        keywords: ['武道', 'スポーツ'],
        shortcodes: [':martial_arts_uniform:'],
      },
      {
        emoji: '🎽',
        name: '陸上シャツ',
        keywords: ['陸上', 'スポーツ'],
        shortcodes: [':running_shirt:'],
      },
      {
        emoji: '🛹',
        name: 'スケートボード',
        keywords: ['スケボー', 'スポーツ'],
        shortcodes: [':skateboard:'],
      },
      {
        emoji: '🛷',
        name: 'そり',
        keywords: ['そり', '冬'],
        shortcodes: [':sled:'],
      },
      {
        emoji: '⛸️',
        name: 'アイススケート',
        keywords: ['スケート', '冬'],
        shortcodes: [':ice_skate:'],
      },
      {
        emoji: '🥌',
        name: 'カーリング',
        keywords: ['カーリング', '冬'],
        shortcodes: [':curling_stone:'],
      },
      {
        emoji: '🎿',
        name: 'スキー',
        keywords: ['スキー', '冬'],
        shortcodes: [':ski:'],
      },
      {
        emoji: '⛷️',
        name: 'スキーヤー',
        keywords: ['スキー', '冬'],
        shortcodes: [':skier:'],
      },
      {
        emoji: '🏂',
        name: 'スノーボード',
        keywords: ['スノボー', '冬'],
        shortcodes: [':snowboarder:'],
      },
      {
        emoji: '🪂',
        name: 'パラシュート',
        keywords: ['パラシュート', '空'],
        shortcodes: [':parachute:'],
      },
      {
        emoji: '🏋️',
        name: 'ウエイトリフティング',
        keywords: ['筋トレ', 'スポーツ'],
        shortcodes: [':weight_lifter:'],
      },
      {
        emoji: '🤼',
        name: 'レスリング',
        keywords: ['レスリング', 'スポーツ'],
        shortcodes: [':wrestlers:'],
      },
      {
        emoji: '🤸',
        name: '体操',
        keywords: ['体操', 'スポーツ'],
        shortcodes: [':cartwheels:'],
      },
      {
        emoji: '⛹️',
        name: 'バスケットボール選手',
        keywords: ['バスケ', 'スポーツ'],
        shortcodes: [':basketball_player:'],
      },
      {
        emoji: '🤺',
        name: 'フェンシング',
        keywords: ['フェンシング', 'スポーツ'],
        shortcodes: [':fencer:'],
      },
      {
        emoji: '🏇',
        name: '競馬',
        keywords: ['競馬', 'スポーツ'],
        shortcodes: [':horse_racing:'],
      },
      {
        emoji: '🧘',
        name: 'ヨガ',
        keywords: ['ヨガ', '瞑想'],
        shortcodes: [':lotus_position:'],
      },
      {
        emoji: '🏄',
        name: 'サーフィン',
        keywords: ['サーフィン', '海'],
        shortcodes: [':surfer:'],
      },
      {
        emoji: '🏊',
        name: '水泳',
        keywords: ['水泳', 'スポーツ'],
        shortcodes: [':swimmer:'],
      },
      {
        emoji: '🤽',
        name: '水球',
        keywords: ['水球', 'スポーツ'],
        shortcodes: [':water_polo:'],
      },
      {
        emoji: '🚣',
        name: 'ボート',
        keywords: ['ボート', '水上'],
        shortcodes: [':rowboat:'],
      },
      {
        emoji: '🧗',
        name: 'クライミング',
        keywords: ['クライミング', 'スポーツ'],
        shortcodes: [':climbing:'],
      },
      {
        emoji: '🚴',
        name: 'サイクリング',
        keywords: ['自転車', 'スポーツ'],
        shortcodes: [':bicyclist:'],
      },
      {
        emoji: '🚵',
        name: 'マウンテンバイク',
        keywords: ['マウンテンバイク', 'スポーツ'],
        shortcodes: [':mountain_bicyclist:'],
      },
      {
        emoji: '🤾',
        name: 'ハンドボール',
        keywords: ['ハンドボール', 'スポーツ'],
        shortcodes: [':handball:'],
      },
      {
        emoji: '🏃',
        name: 'ランニング',
        keywords: ['ランニング', 'スポーツ'],
        shortcodes: [':runner:'],
      },
      {
        emoji: '🕴️',
        name: '宙に浮く男性',
        keywords: ['浮遊', 'マジック'],
        shortcodes: [':levitate:'],
      },
    ],
  },
  {
    id: 'travel',
    name: '旅行・場所',
    icon: '🗺️',
    emojis: [
      {
        emoji: '🗺️',
        name: '世界地図',
        keywords: ['地図', '世界'],
        shortcodes: [':world_map:'],
      },
      {
        emoji: '🗾',
        name: '日本地図',
        keywords: ['日本', '地図'],
        shortcodes: [':japan:'],
      },
      {
        emoji: '🧭',
        name: 'コンパス',
        keywords: ['コンパス', '方位'],
        shortcodes: [':compass:'],
      },
      {
        emoji: '🏔️',
        name: '雪山',
        keywords: ['山', '雪'],
        shortcodes: [':mountain_snow:'],
      },
      {
        emoji: '⛰️',
        name: '山',
        keywords: ['山', '自然'],
        shortcodes: [':mountain:'],
      },
      {
        emoji: '🌋',
        name: '火山',
        keywords: ['火山', '山'],
        shortcodes: [':volcano:'],
      },
      {
        emoji: '🗻',
        name: '富士山',
        keywords: ['富士山', '日本'],
        shortcodes: [':mount_fuji:'],
      },
      {
        emoji: '🏕️',
        name: 'キャンプ',
        keywords: ['キャンプ', 'アウトドア'],
        shortcodes: [':camping:'],
      },
      {
        emoji: '🏖️',
        name: 'ビーチ',
        keywords: ['ビーチ', '海'],
        shortcodes: [':beach:'],
      },
      {
        emoji: '🏜️',
        name: '砂漠',
        keywords: ['砂漠', '暑い'],
        shortcodes: [':desert:'],
      },
      {
        emoji: '🏝️',
        name: '島',
        keywords: ['島', '海'],
        shortcodes: [':island:'],
      },
      {
        emoji: '🏞️',
        name: '国立公園',
        keywords: ['自然', '公園'],
        shortcodes: [':national_park:'],
      },
      {
        emoji: '🏟️',
        name: 'スタジアム',
        keywords: ['スタジアム', 'スポーツ'],
        shortcodes: [':stadium:'],
      },
      {
        emoji: '🏛️',
        name: '古典建築',
        keywords: ['建物', '古典'],
        shortcodes: [':classical_building:'],
      },
      {
        emoji: '🏗️',
        name: '建設中',
        keywords: ['建設', '工事'],
        shortcodes: [':building_construction:'],
      },
      {
        emoji: '🧱',
        name: 'レンガ',
        keywords: ['レンガ', '建材'],
        shortcodes: [':bricks:'],
      },
      {
        emoji: '🪨',
        name: '岩',
        keywords: ['岩', '石'],
        shortcodes: [':rock:'],
      },
      {
        emoji: '🪵',
        name: '木',
        keywords: ['木', '材木'],
        shortcodes: [':wood:'],
      },
      {
        emoji: '🛖',
        name: '小屋',
        keywords: ['小屋', '家'],
        shortcodes: [':hut:'],
      },
      {
        emoji: '🏘️',
        name: '住宅街',
        keywords: ['住宅', '街'],
        shortcodes: [':houses:'],
      },
      {
        emoji: '🏚️',
        name: '廃屋',
        keywords: ['廃屋', '古い'],
        shortcodes: [':derelict_house:'],
      },
      {
        emoji: '🏠',
        name: '家',
        keywords: ['家', '住宅'],
        shortcodes: [':house:'],
      },
      {
        emoji: '🏡',
        name: '庭付きの家',
        keywords: ['家', '庭'],
        shortcodes: [':house_with_garden:'],
      },
      {
        emoji: '🏢',
        name: 'オフィスビル',
        keywords: ['ビル', 'オフィス'],
        shortcodes: [':office:'],
      },
      {
        emoji: '🏣',
        name: '日本の郵便局',
        keywords: ['郵便局', '日本'],
        shortcodes: [':post_office:'],
      },
      {
        emoji: '🏤',
        name: 'ヨーロッパの郵便局',
        keywords: ['郵便局', 'ヨーロッパ'],
        shortcodes: [':european_post_office:'],
      },
      {
        emoji: '🏥',
        name: '病院',
        keywords: ['病院', '医療'],
        shortcodes: [':hospital:'],
      },
      {
        emoji: '🏦',
        name: '銀行',
        keywords: ['銀行', 'お金'],
        shortcodes: [':bank:'],
      },
      {
        emoji: '🏨',
        name: 'ホテル',
        keywords: ['ホテル', '宿泊'],
        shortcodes: [':hotel:'],
      },
      {
        emoji: '🏩',
        name: 'ラブホテル',
        keywords: ['ラブホテル', '宿泊'],
        shortcodes: [':love_hotel:'],
      },
      {
        emoji: '🏪',
        name: 'コンビニ',
        keywords: ['コンビニ', '店'],
        shortcodes: [':convenience_store:'],
      },
      {
        emoji: '🏫',
        name: '学校',
        keywords: ['学校', '教育'],
        shortcodes: [':school:'],
      },
      {
        emoji: '🏬',
        name: 'デパート',
        keywords: ['デパート', '買い物'],
        shortcodes: [':department_store:'],
      },
      {
        emoji: '🏭',
        name: '工場',
        keywords: ['工場', '産業'],
        shortcodes: [':factory:'],
      },
      {
        emoji: '🏯',
        name: '日本の城',
        keywords: ['城', '日本'],
        shortcodes: [':japanese_castle:'],
      },
      {
        emoji: '🏰',
        name: 'ヨーロッパの城',
        keywords: ['城', 'ヨーロッパ'],
        shortcodes: [':european_castle:'],
      },
      {
        emoji: '💒',
        name: '結婚式',
        keywords: ['結婚式', '教会'],
        shortcodes: [':wedding:'],
      },
      {
        emoji: '🗼',
        name: '東京タワー',
        keywords: ['東京タワー', '日本'],
        shortcodes: [':tokyo_tower:'],
      },
      {
        emoji: '🗽',
        name: '自由の女神',
        keywords: ['自由の女神', 'アメリカ'],
        shortcodes: [':statue_of_liberty:'],
      },
      {
        emoji: '⛪',
        name: '教会',
        keywords: ['教会', '宗教'],
        shortcodes: [':church:'],
      },
      {
        emoji: '🕌',
        name: 'モスク',
        keywords: ['モスク', 'イスラム'],
        shortcodes: [':mosque:'],
      },
      {
        emoji: '🛕',
        name: 'ヒンドゥー寺院',
        keywords: ['寺院', 'ヒンドゥー'],
        shortcodes: [':hindu_temple:'],
      },
      {
        emoji: '🕍',
        name: 'シナゴーグ',
        keywords: ['シナゴーグ', 'ユダヤ'],
        shortcodes: [':synagogue:'],
      },
      {
        emoji: '⛩️',
        name: '神社',
        keywords: ['神社', '日本'],
        shortcodes: [':shinto_shrine:'],
      },
      {
        emoji: '🕋',
        name: 'カーバ神殿',
        keywords: ['カーバ', 'イスラム'],
        shortcodes: [':kaaba:'],
      },
    ],
  },
  {
    id: 'objects',
    name: 'もの・道具',
    icon: '📱',
    emojis: [
      {
        emoji: '📱',
        name: 'スマートフォン',
        keywords: ['スマホ', '携帯'],
        shortcodes: [':iphone:'],
      },
      {
        emoji: '📲',
        name: '着信中の携帯',
        keywords: ['着信', '携帯'],
        shortcodes: [':calling:'],
      },
      {
        emoji: '☎️',
        name: '電話',
        keywords: ['電話', '固定電話'],
        shortcodes: [':phone:'],
      },
      {
        emoji: '📞',
        name: '電話の受話器',
        keywords: ['電話', '受話器'],
        shortcodes: [':telephone_receiver:'],
      },
      {
        emoji: '📟',
        name: 'ポケベル',
        keywords: ['ポケベル', '古い'],
        shortcodes: [':pager:'],
      },
      {
        emoji: '📠',
        name: 'ファックス',
        keywords: ['ファックス', 'オフィス'],
        shortcodes: [':fax:'],
      },
      {
        emoji: '🔋',
        name: 'バッテリー',
        keywords: ['バッテリー', '電池'],
        shortcodes: [':battery:'],
      },
      {
        emoji: '🔌',
        name: 'コンセント',
        keywords: ['コンセント', '電気'],
        shortcodes: [':electric_plug:'],
      },
      {
        emoji: '💻',
        name: 'ノートパソコン',
        keywords: ['パソコン', 'PC'],
        shortcodes: [':computer:'],
      },
      {
        emoji: '🖥️',
        name: 'デスクトップ',
        keywords: ['デスクトップ', 'PC'],
        shortcodes: [':desktop_computer:'],
      },
      {
        emoji: '🖨️',
        name: 'プリンター',
        keywords: ['プリンター', 'オフィス'],
        shortcodes: [':printer:'],
      },
      {
        emoji: '⌨️',
        name: 'キーボード',
        keywords: ['キーボード', 'PC'],
        shortcodes: [':keyboard:'],
      },
      {
        emoji: '🖱️',
        name: 'マウス',
        keywords: ['マウス', 'PC'],
        shortcodes: [':computer_mouse:'],
      },
      {
        emoji: '🖲️',
        name: 'トラックボール',
        keywords: ['トラックボール', 'PC'],
        shortcodes: [':trackball:'],
      },
      {
        emoji: '💽',
        name: 'MD',
        keywords: ['MD', '音楽'],
        shortcodes: [':minidisc:'],
      },
      {
        emoji: '💾',
        name: 'フロッピーディスク',
        keywords: ['フロッピー', '保存'],
        shortcodes: [':floppy_disk:'],
      },
      {
        emoji: '💿',
        name: 'CD',
        keywords: ['CD', '音楽'],
        shortcodes: [':cd:'],
      },
      {
        emoji: '📀',
        name: 'DVD',
        keywords: ['DVD', '映画'],
        shortcodes: [':dvd:'],
      },
      {
        emoji: '🧮',
        name: 'そろばん',
        keywords: ['そろばん', '計算'],
        shortcodes: [':abacus:'],
      },
      {
        emoji: '🎥',
        name: 'ビデオカメラ',
        keywords: ['ビデオカメラ', '撮影'],
        shortcodes: [':movie_camera:'],
      },
      {
        emoji: '🎞️',
        name: 'フィルム',
        keywords: ['フィルム', '映画'],
        shortcodes: [':film_frames:'],
      },
      {
        emoji: '📽️',
        name: '映写機',
        keywords: ['映写機', '映画'],
        shortcodes: [':projector:'],
      },
      {
        emoji: '🎬',
        name: 'カチンコ',
        keywords: ['カチンコ', '映画'],
        shortcodes: [':clapper:'],
      },
      {
        emoji: '📺',
        name: 'テレビ',
        keywords: ['テレビ', 'TV'],
        shortcodes: [':tv:'],
      },
      {
        emoji: '📷',
        name: 'カメラ',
        keywords: ['カメラ', '写真'],
        shortcodes: [':camera:'],
      },
      {
        emoji: '📸',
        name: 'フラッシュ付きカメラ',
        keywords: ['カメラ', 'フラッシュ'],
        shortcodes: [':camera_with_flash:'],
      },
      {
        emoji: '📹',
        name: 'ビデオカメラ',
        keywords: ['ビデオカメラ', '撮影'],
        shortcodes: [':video_camera:'],
      },
      {
        emoji: '📼',
        name: 'ビデオテープ',
        keywords: ['ビデオテープ', '古い'],
        shortcodes: [':vhs:'],
      },
      {
        emoji: '🔍',
        name: '虫眼鏡（左）',
        keywords: ['虫眼鏡', '検索'],
        shortcodes: [':mag:'],
      },
      {
        emoji: '🔎',
        name: '虫眼鏡（右）',
        keywords: ['虫眼鏡', '検索'],
        shortcodes: [':mag_right:'],
      },
      {
        emoji: '🕯️',
        name: 'ろうそく',
        keywords: ['ろうそく', '明かり'],
        shortcodes: [':candle:'],
      },
      {
        emoji: '💡',
        name: '電球',
        keywords: ['電球', 'アイデア'],
        shortcodes: [':bulb:'],
      },
      {
        emoji: '🔦',
        name: '懐中電灯',
        keywords: ['懐中電灯', '明かり'],
        shortcodes: [':flashlight:'],
      },
      {
        emoji: '🏮',
        name: '提灯',
        keywords: ['提灯', '日本'],
        shortcodes: [':izakaya_lantern:'],
      },
      {
        emoji: '🪔',
        name: 'オイルランプ',
        keywords: ['オイルランプ', '明かり'],
        shortcodes: [':diya_lamp:'],
      },
      {
        emoji: '📔',
        name: 'ノート',
        keywords: ['ノート', '本'],
        shortcodes: [':notebook_with_decorative_cover:'],
      },
      {
        emoji: '📕',
        name: '閉じた本',
        keywords: ['本', '読書'],
        shortcodes: [':closed_book:'],
      },
      {
        emoji: '📖',
        name: '開いた本',
        keywords: ['本', '読書'],
        shortcodes: [':book:'],
      },
      {
        emoji: '📗',
        name: '緑の本',
        keywords: ['本', '緑'],
        shortcodes: [':green_book:'],
      },
      {
        emoji: '📘',
        name: '青い本',
        keywords: ['本', '青'],
        shortcodes: [':blue_book:'],
      },
      {
        emoji: '📙',
        name: 'オレンジの本',
        keywords: ['本', 'オレンジ'],
        shortcodes: [':orange_book:'],
      },
      {
        emoji: '📚',
        name: '本の山',
        keywords: ['本', '勉強'],
        shortcodes: [':books:'],
      },
      {
        emoji: '📓',
        name: 'ノート',
        keywords: ['ノート', '勉強'],
        shortcodes: [':notebook:'],
      },
      {
        emoji: '📒',
        name: '台帳',
        keywords: ['台帳', '記録'],
        shortcodes: [':ledger:'],
      },
      {
        emoji: '📃',
        name: '紙',
        keywords: ['紙', '文書'],
        shortcodes: [':page_with_curl:'],
      },
      {
        emoji: '📜',
        name: '巻物',
        keywords: ['巻物', '古い'],
        shortcodes: [':scroll:'],
      },
      {
        emoji: '📄',
        name: '文書',
        keywords: ['文書', '紙'],
        shortcodes: [':page_facing_up:'],
      },
      {
        emoji: '📰',
        name: '新聞',
        keywords: ['新聞', 'ニュース'],
        shortcodes: [':newspaper:'],
      },
      {
        emoji: '🗞️',
        name: '丸めた新聞',
        keywords: ['新聞', 'ニュース'],
        shortcodes: [':rolled_up_newspaper:'],
      },
      {
        emoji: '📑',
        name: 'しおり',
        keywords: ['しおり', '本'],
        shortcodes: [':bookmark_tabs:'],
      },
      {
        emoji: '🔖',
        name: 'しおり',
        keywords: ['しおり', '本'],
        shortcodes: [':bookmark:'],
      },
      {
        emoji: '🏷️',
        name: 'ラベル',
        keywords: ['ラベル', 'タグ'],
        shortcodes: [':label:'],
      },
    ],
  },
  {
    id: 'symbols',
    name: '記号・マーク',
    icon: '❤️',
    emojis: [
      {
        emoji: '❤️',
        name: '赤いハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':heart:'],
      },
      {
        emoji: '🧡',
        name: 'オレンジのハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':orange_heart:'],
      },
      {
        emoji: '💛',
        name: '黄色いハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':yellow_heart:'],
      },
      {
        emoji: '💚',
        name: '緑のハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':green_heart:'],
      },
      {
        emoji: '💙',
        name: '青いハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':blue_heart:'],
      },
      {
        emoji: '💜',
        name: '紫のハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':purple_heart:'],
      },
      {
        emoji: '🤎',
        name: '茶色いハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':brown_heart:'],
      },
      {
        emoji: '🖤',
        name: '黒いハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':black_heart:'],
      },
      {
        emoji: '🤍',
        name: '白いハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':white_heart:'],
      },
      {
        emoji: '💔',
        name: '壊れたハート',
        keywords: ['失恋', 'ハート'],
        shortcodes: [':broken_heart:'],
      },
      {
        emoji: '❣️',
        name: 'ハートの感嘆符',
        keywords: ['愛', 'ハート'],
        shortcodes: [':heavy_heart_exclamation:'],
      },
      {
        emoji: '💕',
        name: '2つのハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':two_hearts:'],
      },
      {
        emoji: '💞',
        name: '回転するハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':revolving_hearts:'],
      },
      {
        emoji: '💓',
        name: '鼓動するハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':heartbeat:'],
      },
      {
        emoji: '💗',
        name: '成長するハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':heartpulse:'],
      },
      {
        emoji: '💖',
        name: 'きらめくハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':sparkling_heart:'],
      },
      {
        emoji: '💘',
        name: '矢の刺さったハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':cupid:'],
      },
      {
        emoji: '💝',
        name: 'リボン付きハート',
        keywords: ['愛', 'ハート'],
        shortcodes: [':gift_heart:'],
      },
      {
        emoji: '💟',
        name: 'ハートの装飾',
        keywords: ['愛', 'ハート'],
        shortcodes: [':heart_decoration:'],
      },
      {
        emoji: '☮️',
        name: 'ピースマーク',
        keywords: ['平和', 'ピース'],
        shortcodes: [':peace_symbol:'],
      },
      {
        emoji: '✝️',
        name: '十字架',
        keywords: ['十字架', 'キリスト教'],
        shortcodes: [':latin_cross:'],
      },
      {
        emoji: '☪️',
        name: '三日月と星',
        keywords: ['イスラム', '三日月'],
        shortcodes: [':star_and_crescent:'],
      },
      {
        emoji: '🕉️',
        name: 'オーム',
        keywords: ['ヒンドゥー', 'オーム'],
        shortcodes: [':om:'],
      },
      {
        emoji: '☸️',
        name: '法輪',
        keywords: ['仏教', '法輪'],
        shortcodes: [':wheel_of_dharma:'],
      },
      {
        emoji: '✡️',
        name: 'ダビデの星',
        keywords: ['ユダヤ', 'ダビデの星'],
        shortcodes: [':star_of_david:'],
      },
      {
        emoji: '🔯',
        name: '六芒星',
        keywords: ['六芒星', '星'],
        shortcodes: [':six_pointed_star:'],
      },
      {
        emoji: '🕎',
        name: 'メノーラー',
        keywords: ['ユダヤ', 'メノーラー'],
        shortcodes: [':menorah:'],
      },
      {
        emoji: '☯️',
        name: '陰陽',
        keywords: ['陰陽', '中国'],
        shortcodes: [':yin_yang:'],
      },
      {
        emoji: '☦️',
        name: '正教会十字',
        keywords: ['正教会', '十字架'],
        shortcodes: [':orthodox_cross:'],
      },
      {
        emoji: '🛐',
        name: '礼拝所',
        keywords: ['礼拝', '宗教'],
        shortcodes: [':place_of_worship:'],
      },
      {
        emoji: '⛎',
        name: 'へびつかい座',
        keywords: ['へびつかい座', '星座'],
        shortcodes: [':ophiuchus:'],
      },
      {
        emoji: '♈',
        name: 'おひつじ座',
        keywords: ['おひつじ座', '星座'],
        shortcodes: [':aries:'],
      },
      {
        emoji: '♉',
        name: 'おうし座',
        keywords: ['おうし座', '星座'],
        shortcodes: [':taurus:'],
      },
      {
        emoji: '♊',
        name: 'ふたご座',
        keywords: ['ふたご座', '星座'],
        shortcodes: [':gemini:'],
      },
      {
        emoji: '♋',
        name: 'かに座',
        keywords: ['かに座', '星座'],
        shortcodes: [':cancer:'],
      },
      {
        emoji: '♌',
        name: 'しし座',
        keywords: ['しし座', '星座'],
        shortcodes: [':leo:'],
      },
      {
        emoji: '♍',
        name: 'おとめ座',
        keywords: ['おとめ座', '星座'],
        shortcodes: [':virgo:'],
      },
      {
        emoji: '♎',
        name: 'てんびん座',
        keywords: ['てんびん座', '星座'],
        shortcodes: [':libra:'],
      },
      {
        emoji: '♏',
        name: 'さそり座',
        keywords: ['さそり座', '星座'],
        shortcodes: [':scorpius:'],
      },
      {
        emoji: '♐',
        name: 'いて座',
        keywords: ['いて座', '星座'],
        shortcodes: [':sagittarius:'],
      },
      {
        emoji: '♑',
        name: 'やぎ座',
        keywords: ['やぎ座', '星座'],
        shortcodes: [':capricorn:'],
      },
      {
        emoji: '♒',
        name: 'みずがめ座',
        keywords: ['みずがめ座', '星座'],
        shortcodes: [':aquarius:'],
      },
      {
        emoji: '♓',
        name: 'うお座',
        keywords: ['うお座', '星座'],
        shortcodes: [':pisces:'],
      },
      {
        emoji: '🆔',
        name: 'ID',
        keywords: ['ID', '識別'],
        shortcodes: [':id:'],
      },
      {
        emoji: '⚛️',
        name: '原子記号',
        keywords: ['原子', '科学'],
        shortcodes: [':atom_symbol:'],
      },
      {
        emoji: '🉑',
        name: '可',
        keywords: ['可', '日本'],
        shortcodes: [':accept:'],
      },
      {
        emoji: '☢️',
        name: '放射能',
        keywords: ['放射能', '危険'],
        shortcodes: [':radioactive:'],
      },
      {
        emoji: '☣️',
        name: 'バイオハザード',
        keywords: ['バイオハザード', '危険'],
        shortcodes: [':biohazard:'],
      },
      {
        emoji: '📴',
        name: '携帯電話オフ',
        keywords: ['携帯オフ', '禁止'],
        shortcodes: [':mobile_phone_off:'],
      },
      {
        emoji: '📳',
        name: 'バイブレーション',
        keywords: ['バイブ', '携帯'],
        shortcodes: [':vibration_mode:'],
      },
    ],
  },
]

// Search emojis by keyword or name
export function searchEmojis(query: string): Emoji[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase().trim()
  const results: Emoji[] = []

  EMOJI_CATEGORIES.forEach(category => {
    category.emojis.forEach(emoji => {
      if (
        emoji.name.toLowerCase().includes(lowerQuery) ||
        emoji.keywords.some(keyword =>
          keyword.toLowerCase().includes(lowerQuery)
        ) ||
        emoji.shortcodes.some(code => code.toLowerCase().includes(lowerQuery))
      ) {
        results.push(emoji)
      }
    })
  })

  // Limit search results to prevent UI performance issues
  return results.slice(0, 200)
}

// Get emojis by category
export function getEmojisByCategory(categoryId: string): Emoji[] {
  const category = EMOJI_CATEGORIES.find(cat => cat.id === categoryId)
  return category ? category.emojis : []
}

// Get all emojis
export function getAllEmojis(): Emoji[] {
  return EMOJI_CATEGORIES.flatMap(category => category.emojis)
}

// Get recently used emojis from localStorage
export function getRecentlyUsedEmojis(): Emoji[] {
  try {
    const recent = localStorage.getItem('recently-used-emojis')
    if (!recent) return []

    const recentEmojis: string[] = JSON.parse(recent)
    const allEmojis = getAllEmojis()

    return recentEmojis
      .map(emojiChar => allEmojis.find(emoji => emoji.emoji === emojiChar))
      .filter((emoji): emoji is Emoji => emoji !== undefined)
  } catch {
    return []
  }
}

// Add emoji to recently used list
export function addToRecentlyUsed(emoji: Emoji): void {
  try {
    const recent = getRecentlyUsedEmojis()
    const filtered = recent.filter(e => e.emoji !== emoji.emoji)
    const updated = [emoji, ...filtered].slice(0, 30) // Keep only 30 recent emojis

    localStorage.setItem(
      'recently-used-emojis',
      JSON.stringify(updated.map(e => e.emoji))
    )
  } catch {
    // Ignore localStorage errors
  }
}

// Copy emoji to clipboard
export async function copyEmojiToClipboard(emoji: Emoji): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(emoji.emoji)
    addToRecentlyUsed(emoji)
    return true
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = emoji.emoji
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      addToRecentlyUsed(emoji)
      return true
    } catch {
      return false
    }
  }
}

// Get emoji skin tone variants (simplified version)
export function getEmojiVariants(emoji: Emoji): Emoji[] {
  const skinTones = ['🏻', '🏼', '🏽', '🏾', '🏿']
  const variants: Emoji[] = []

  // Only add variants for emojis that support skin tones
  const supportsSkinTone = [
    '👋',
    '🤚',
    '🖐️',
    '✋',
    '🖖',
    '👌',
    '🤏',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '🖕',
    '👇',
    '☝️',
    '👍',
    '👎',
    '✊',
    '👊',
    '🤛',
    '🤜',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🙏',
    '✍️',
    '💅',
    '🤳',
    '💪',
    '🦵',
    '🦶',
    '👂',
    '👃',
    '👶',
    '🧒',
    '👦',
    '👧',
    '🧑',
    '👱',
    '👨',
    '🧔',
    '👱‍♂️',
    '👨‍🦰',
    '👨‍🦱',
    '👨‍🦳',
    '👨‍🦲',
    '👩',
    '👱‍♀️',
    '👩‍🦰',
    '🧑‍🦰',
    '👩‍🦱',
    '🧑‍🦱',
    '👩‍🦳',
    '🧑‍🦳',
    '👩‍🦲',
    '🧑‍🦲',
    '👴',
    '👵',
  ]

  if (supportsSkinTone.includes(emoji.emoji)) {
    skinTones.forEach(tone => {
      variants.push({
        emoji: emoji.emoji + tone,
        name: `${emoji.name} (${getToneName(tone)})`,
        keywords: emoji.keywords,
        shortcodes: emoji.shortcodes,
      })
    })
  }

  return variants
}

function getToneName(tone: string): string {
  switch (tone) {
    case '🏻':
      return '薄い肌色'
    case '🏼':
      return 'やや薄い肌色'
    case '🏽':
      return '普通の肌色'
    case '🏾':
      return 'やや濃い肌色'
    case '🏿':
      return '濃い肌色'
    default:
      return ''
  }
}
