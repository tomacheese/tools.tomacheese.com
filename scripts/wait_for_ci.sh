#!/bin/bash
set -x # デバッグ出力を有効にする

# 引数の解析
LOOP=false
if [[ "$1" == "--loop" ]]; then
  LOOP=true
fi

PR_NUMBER=$(gh pr view --json number -q .number)
PR_HEAD_REF=$(gh pr view --json headRefName -q .headRefName)

while true; do
  # Get the latest workflow run for the current branch
  RUN_INFO=$(gh run list --workflow "Node.js CI" --json headBranch,databaseId,status,conclusion -q ".[] | select(.headBranch == \"$PR_HEAD_REF\") | {databaseId: .databaseId, status: .status, conclusion: .conclusion}" | head -n 1)

  if [ -z "$RUN_INFO" ]; then
    echo "No workflow run found for branch $PR_HEAD_REF. Waiting..."
    if [ "$LOOP" = false ]; then
      exit 0
    fi
    sleep 30
    continue
  fi

  RUN_ID=$(echo "$RUN_INFO" | jq -r '.databaseId')
  RUN_STATUS=$(echo "$RUN_INFO" | jq -r '.status')
  RUN_CONCLUSION=$(echo "$RUN_INFO" | jq -r '.conclusion')

  echo "Current workflow run status: $RUN_STATUS, conclusion: $RUN_CONCLUSION"

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
  else # in_progress 以外のステータスであれば終了
    echo "Workflow run is not yet completed. Current status: $RUN_STATUS."
    gh run view "$RUN_ID"
    if [ "$LOOP" = false ]; then
      exit 0
    fi
    sleep 30
  fi
done