# install-skills.ps1 - Install all 16 bundled skills to Antigravity / Claude Code global config
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSourceDir = Join-Path $ScriptDir "skills"

if (-not (Test-Path $SkillsSourceDir)) {
    Write-Error "Direktori skills tidak ditemukan di: $SkillsSourceDir"
    exit 1
}

$Targets = @(
    (Join-Path $env:USERPROFILE ".gemini\config\skills"),
    (Join-Path $env:USERPROFILE ".claude\skills")
)

$SkillFolders = Get-ChildItem -Path $SkillsSourceDir -Directory
Write-Host "Ditemukan $($SkillFolders.Count) skill & preset di $SkillsSourceDir" -ForegroundColor Cyan

foreach ($Target in $Targets) {
    if (-not (Test-Path $Target)) {
        New-Item -ItemType Directory -Path $Target -Force | Out-Null
    }
    Write-Host "Menginstal ke: $Target ..." -ForegroundColor Yellow
    foreach ($Folder in $SkillFolders) {
        $Dest = Join-Path $Target $Folder.Name
        Copy-Item -Path $Folder.FullName -Destination $Dest -Recurse -Force
        Write-Host "  + $($Folder.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nSukses! Seluruh $($SkillFolders.Count) skill & preset telah terpasang di komputer ini." -ForegroundColor Green
Write-Host "Sekarang Anda dapat menggunakan /studio-team, /fullstack-team, /aoi-team, /db-team, dll di semua project!" -ForegroundColor Green
