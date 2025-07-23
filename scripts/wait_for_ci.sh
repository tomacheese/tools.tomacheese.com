#!/bin/bash
set -e # エラー時に即座に終了する設定を有効にする

# 引数の解析
LOOP=true # デフォルトでループを有効にする
DEBUG=false
TIMEOUT=3600 # デフォルトタイムアウト（1時間）
INTERVAL=30 # チェック間隔（秒）

print_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  --no-loop     一度だけチェックして終了"
  echo "  --debug       デバッグ出力を有効化"
  echo "  --timeout N   タイムアウト時間（秒、デフォルト: 3600）"
  echo "  --interval N  チェック間隔（秒、デフォルト: 30）"
  echo "  --help        このヘルプを表示"
  echo ""
  echo "例:"
  echo "  $0                    通常の監視モード"
  echo "  $0 --no-loop         現在の状態をチェックして終了"
  echo "  $0 --debug           デバッグ出力付きで監視"
  echo "  $0 --timeout 1800    30分でタイムアウト"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --no-loop)
      LOOP=false
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --interval)
      INTERVAL="$2"
      shift 2
      ;;
    --help|-h)
      print_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Use --help for usage information."
      exit 1
      ;;
  esac
done

if [ "$DEBUG" = true ]; then
  set -x # デバッグ出力を有効にする
fi

# PRの情報を取得（エラーハンドリング付き）
if ! PR_INFO=$(gh pr view --json number,headRefName 2>/dev/null); then
  echo "Error: Could not get PR information. Are you in a repository with an active PR?"
  exit 1
fi

PR_NUMBER=$(echo "$PR_INFO" | jq -r '.number')
PR_HEAD_REF=$(echo "$PR_INFO" | jq -r '.headRefName')

echo "Monitoring CI for PR #$PR_NUMBER (branch: $PR_HEAD_REF)"
echo "Timeout: ${TIMEOUT}s, Check interval: ${INTERVAL}s"

if [ "$LOOP" = false ]; then
  echo "One-time check mode enabled"
fi

START_TIME=$(date +%s)

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED_TIME=$((CURRENT_TIME - START_TIME))

  # タイムアウトチェック
  if [ "$LOOP" = true ] && [ $ELAPSED_TIME -gt $TIMEOUT ]; then
    echo "Timeout reached (${TIMEOUT}s). CI monitoring stopped."
    exit 1
  fi

  # 最新のワークフロー実行を取得
  RUN_INFO=$(gh run list --workflow "Node.js CI" --limit 10 --json headBranch,databaseId,status,conclusion,createdAt -q ".[] | select(.headBranch == \"$PR_HEAD_REF\")" | head -n 1)

  if [ -z "$RUN_INFO" ]; then
    echo "Elapsed: ${ELAPSED_TIME}s - No workflow run found for branch $PR_HEAD_REF. Waiting..."
    if [ "$LOOP" = false ]; then
      echo "No CI run found for this branch."
      exit 0
    fi
    sleep $INTERVAL
    continue
  fi

  RUN_ID=$(echo "$RUN_INFO" | jq -r '.databaseId')
  RUN_STATUS=$(echo "$RUN_INFO" | jq -r '.status')
  RUN_CONCLUSION=$(echo "$RUN_INFO" | jq -r '.conclusion')
  RUN_CREATED=$(echo "$RUN_INFO" | jq -r '.createdAt')

  if [ "$DEBUG" = true ]; then
    echo "DEBUG: Run ID: $RUN_ID"
    echo "DEBUG: Created: $RUN_CREATED"
  fi

  # 進捗表示
  case $RUN_STATUS in
    "queued")
      echo "Elapsed: ${ELAPSED_TIME}s - ⏳ Workflow queued, waiting to start..."
      ;;
    "in_progress")
      echo "Elapsed: ${ELAPSED_TIME}s - 🏃 Workflow running..."
      ;;
    "completed")
      case $RUN_CONCLUSION in
        "success")
          echo "✅ All CI checks completed successfully! (${ELAPSED_TIME}s)"
          gh run view "$RUN_ID" --json jobs -q '.jobs[] | select(.conclusion != "success") | {name: .name, conclusion: .conclusion}' 2>/dev/null || true
          exit 0
          ;;
        "failure")
          echo "❌ CI checks failed after ${ELAPSED_TIME}s"
          echo "Failed jobs:"
          gh run view "$RUN_ID" --json jobs -q '.jobs[] | select(.conclusion == "failure") | "  - " + .name' 2>/dev/null || true
          gh run view "$RUN_ID"
          exit 1
          ;;
        "cancelled")
          echo "🚫 Workflow was cancelled after ${ELAPSED_TIME}s"
          gh run view "$RUN_ID"
          exit 1
          ;;
        "skipped")
          echo "⏭️  Workflow was skipped after ${ELAPSED_TIME}s"
          gh run view "$RUN_ID"
          exit 0
          ;;
        *)
          echo "🤔 Workflow completed with unknown conclusion: $RUN_CONCLUSION (${ELAPSED_TIME}s)"
          gh run view "$RUN_ID"
          exit 0
          ;;
      esac
      ;;
    *)
      echo "Elapsed: ${ELAPSED_TIME}s - Unknown status: $RUN_STATUS"
      ;;
  esac

  if [ "$LOOP" = false ]; then
    echo "One-time check completed. Current status: $RUN_STATUS"
    exit 0
  fi

  sleep $INTERVAL
done