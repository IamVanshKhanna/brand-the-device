#!/bin/bash
# Hourly optimization trigger — writes a message to god's inbox
# Run via launchd every hour to kick off a 1% site improvement cycle.

INBOX="/Users/anonymousbrat/Downloads/Munder_Difflin/hive/agents/god/inbox"
CHECKLIST="/Users/anonymousbrat/Downloads/Munder_Difflin/ventures/lid-fundraiser/optimization/CHECKLIST.md"
TRACKING="/Users/anonymousbrat/Downloads/Munder_Difflin/ventures/lid-fundraiser/optimization/TRACKING.md"

# Generate unique ID
ID="$(date -u +%Y-%m-%dT%H-%M-%S-%3NZ)-$(openssl rand -hex 4)"

# Count remaining items
REMAINING=$(grep -c '^\- \[ \]' "$CHECKLIST" 2>/dev/null || echo 0)

# If no items remain, skip (don't send message)
if [ "$REMAINING" -eq 0 ]; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) — optimization complete, all items done, skipping" >> "$TRACKING"
  exit 0
fi

# Write inbox message
cat > "$INBOX/${ID}.json" <<EOF
{
  "id": "${ID}",
  "conversation": "opt-hourly",
  "in_reply_to": null,
  "from": "scheduler",
  "to": "god",
  "act": "request",
  "subject": "1% optimization cycle",
  "body": "Hourly 1% optimization cycle. Read optimization/CHECKLIST.md, pick the next unchecked item, implement it, check it off, and log what you did in optimization/TRACKING.md. Commit and push if the change is code. Only ONE item per cycle. Verify the site still serves 200 after the change. If all items are checked, create a new CHECKLIST.md with fresh ideas.",
  "hops": 0,
  "requires_reply": true,
  "needs_human": false,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
}
EOF

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) — optimization trigger sent (${REMAINING} items remaining)" >> "$TRACKING"
