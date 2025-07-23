#!/bin/bash
set -e # エラー時に即座に終了する設定を有効にする

# 引数の解析
LOOP=true # デフォルトでループを有効にする
DEBUG=false

for arg in "$@"; do
  case $arg in
    --no-loop)
      LOOP=false
      shift # 引数を消費
      ;;
    --debug)
      DEBUG=true
      shift # 引数を消費
      ;;
    *)
      # 未知の引数は無視するか、エラーとする
      echo "Unknown argument: $arg"
      exit 1
      ;;
  esac
done

if [ "$DEBUG" = true ]; then
  set -x # デバッグ出力を有効にする
fi

PR_NUMBER=$(gh pr view --json number -q .number)
PR_HEAD_REF=$(gh pr view --json headRefName -q .headRefName)

START_TIME=$(date +%s)

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED_TIME=$((CURRENT_TIME - START_TIME))

  # Get the latest workflow run for the current branch
  RUN_INFO=$(gh run list --workflow "Node.js CI" --json headBranch,databaseId,status,conclusion -q ".[] | select(.headBranch == \"$PR_HEAD_REF\") | {databaseId: .databaseId, status: .status, conclusion: .conclusion}" | head -n 1)

  if [ -z "$RUN_INFO" ]; then
    echo "Elapsed: ${ELAPSED_TIME}s - No workflow run found for branch $PR_HEAD_REF. Waiting..."
    if [ "$LOOP" = false ]; then
      exit 0
    fi
    sleep 30
    continue
  fi

  RUN_ID=$(echo "$RUN_INFO" | jq -r '.databaseId')
  RUN_STATUS=$(echo "$RUN_INFO" | jq -r '.status')
  RUN_CONCLUSION=$(echo "$RUN_INFO" | jq -r '.conclusion')

  echo "Elapsed: ${ELAPSED_TIME}s - Workflow: $RUN_STATUS ($RUN_CONCLUSION)"

  if [ "$RUN_STATUS" == "completed" ]; then
    if [ "$RUN_CONCLUSION" == "success" ]; then
      echo "All CI checks completed successfully."
      gh run view "$RUN_ID"
      exit 0
    elif [ "$RUN_CONCLUSION" == "failure" ]; then
      echo "CI checks failed. Please check the logs for details."
      gh run view "$RUN_ID"
      exit 1 # Exit with an error code
    else
      # Handle other conclusions like 'SKIPPED', 'CANCELLED', etc.
      echo "CI checks completed with conclusion: $RUN_CONCLUSION. This is not a success or failure. Please check the logs for details."
      gh run view "$RUN_ID"
      exit 0
    fi
  else # in_progress の場合のみループを継続
    if [ "$LOOP" = false ]; then
      exit 0
    fi
    sleep 30
  fi
done