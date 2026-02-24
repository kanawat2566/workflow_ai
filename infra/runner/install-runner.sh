#!/bin/bash
# ติดตั้ง GitHub Actions Self-Hosted Runner บน Linux / WSL2
# ใช้: bash infra/runner/install-runner.sh <REPO_URL> <TOKEN>
#
# หา TOKEN ได้จาก:
# GitHub repo → Settings → Actions → Runners → New self-hosted runner

set -e

REPO_URL=$1
TOKEN=$2
RUNNER_VERSION="2.321.0"   # ตรวจ version ล่าสุดที่ github.com/actions/runner/releases

if [ -z "$REPO_URL" ] || [ -z "$TOKEN" ]; then
  echo "Usage: $0 <repo_url> <token>"
  echo "Example: $0 https://github.com/yourname/bot_ai ghp_xxx..."
  exit 1
fi

echo "=== Installing GitHub Actions Runner v${RUNNER_VERSION} ==="

# สร้าง folder
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download runner
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Configure
./config.sh \
  --url "$REPO_URL" \
  --token "$TOKEN" \
  --name "local-docker-runner" \
  --labels "self-hosted,local,docker" \
  --work "_work" \
  --unattended

echo ""
echo "=== Runner configured! ==="
echo ""
echo "Option A: Run once (for testing)"
echo "  ./run.sh"
echo ""
echo "Option B: Install as systemd service (recommended)"
echo "  sudo ./svc.sh install"
echo "  sudo ./svc.sh start"
echo "  sudo ./svc.sh status"
