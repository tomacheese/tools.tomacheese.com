#!/bin/bash
set -x # デバッグ出力を有効にする

PR_NUMBER=$(gh pr view --json number -q .number)
PR_HEAD_REF=$(gh pr view --json headRefName -q .headRefName)

# Get the latest workflow run for the current branch
# Filter by head_branch to ensure we get runs for the current PR branch
RUN_INFO=$(gh run list --workflow "Node.js CI" --json headBranch,databaseId,status,conclusion -q ".[] | select(.headBranch == \"$PR_HEAD_REF\") | {databaseId: .databaseId, status: .status, conclusion: .conclusion}" | head -n 1)

if [ -z "$RUN_INFO" ]; then
  echo "No workflow run found for branch $PR_HEAD_REF. Waiting..."
  sleep 30
  continue
fi

RUN_ID=$(echo "$RUN_INFO" | jq -r '.databaseId')
RUN_STATUS=$(echo "$RUN_INFO" | jq -r '.status')
RUN_CONCLUSION=$(echo "$RUN_INFO" | jq -r '.conclusion')

echo "Current workflow run status: $RUN_STATUS, conclusion: $RUN_CONCLUSION"

if [ "$RUN_STATUS" == "completed" ]; then # ここを小文字に修正
  if [ "$RUN_CONCLUSION" == "success" ]; then # ここを小文字に修正
    echo "All CI checks completed successfully."
    gh run view "$RUN_ID"
    exit 0
  elif [ "$RUN_CONCLUSION" == "failure" ]; then # ここを小文字に修正
    echo "CI checks failed. Please check the logs for details."
    gh run view "$RUN_ID"
    exit 1 # Exit with an error code
  else
    # Handle other conclusions like 'SKIPPED', 'CANCELLED', etc.
    echo "CI checks completed with conclusion: $RUN_CONCLUSION. This is not a success or failure. Please check the logs for details."
    gh run view "$RUN_ID"
    exit 0
  fi
else
  echo "Workflow run is not yet completed. Current status: $RUN_STATUS."
  gh run view "$RUN_ID"
  exit 0
fi