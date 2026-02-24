# ติดตั้ง GitHub Actions Self-Hosted Runner บน Windows
# ใช้: .\infra\runner\install-runner-windows.ps1 -RepoUrl <URL> -Token <TOKEN>
#
# หา TOKEN ได้จาก:
# GitHub repo → Settings → Actions → Runners → New self-hosted runner → Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,

    [Parameter(Mandatory=$true)]
    [string]$Token,

    [string]$RunnerVersion = "2.321.0",
    [string]$RunnerDir = "C:\actions-runner"
)

Write-Host "=== Installing GitHub Actions Runner v$RunnerVersion ===" -ForegroundColor Cyan

# สร้าง folder
if (-not (Test-Path $RunnerDir)) {
    New-Item -ItemType Directory -Path $RunnerDir | Out-Null
}
Set-Location $RunnerDir

# Download runner
$DownloadUrl = "https://github.com/actions/runner/releases/download/v$RunnerVersion/actions-runner-win-x64-$RunnerVersion.zip"
Write-Host "Downloading runner..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile "actions-runner-win-x64-$RunnerVersion.zip"
Expand-Archive -Path "actions-runner-win-x64-$RunnerVersion.zip" -DestinationPath $RunnerDir -Force

# Configure
Write-Host "Configuring runner..."
.\config.cmd `
    --url $RepoUrl `
    --token $Token `
    --name "local-docker-runner-win" `
    --labels "self-hosted,local,docker,windows" `
    --work "_work" `
    --unattended

Write-Host ""
Write-Host "=== Runner configured! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Option A: Run once (for testing)"
Write-Host "  .\run.cmd"
Write-Host ""
Write-Host "Option B: Install as Windows Service (recommended)"
Write-Host "  .\svc.cmd install"
Write-Host "  .\svc.cmd start"
Write-Host "  .\svc.cmd status"
