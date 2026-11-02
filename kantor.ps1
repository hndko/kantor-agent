# Kantor Mari Partner untuk Antigravity (Windows PowerShell)
# Jalankan: .\kantor.ps1 [start|stop|status|restart|url] [-Port 8788]

[CmdletBinding()]
param(
    [ValidateSet('start', 'stop', 'status', 'restart', 'url')]
    [string]$Action = 'start',
    [int]$Port = 8788
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RuntimeDir = Join-Path $ScriptDir "skills\kantor-agent\runtime"
$PidFilePath = Join-Path $env:TEMP "kantor-agent-$Port.pid"

function Get-RunningProcess {
    if (Test-Path $PidFilePath) {
        $savedId = Get-Content $PidFilePath -ErrorAction SilentlyContinue
        if ($savedId -match '^\d+$') {
            $p = Get-Process -Id ([int]$savedId) -ErrorAction SilentlyContinue
            if ($p -and $p.ProcessName -eq 'node') {
                return $p
            }
        }
        Remove-Item $PidFilePath -Force -ErrorAction SilentlyContinue
    }

    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn -and $conn.OwningProcess -gt 0) {
        $p = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($p -and $p.ProcessName -eq 'node') {
            Set-Content $PidFilePath $p.Id
            return $p
        }
    }
    return $null
}

function Get-ActiveAntigravityAccount {
    $accountsFile = Join-Path $env:USERPROFILE ".gemini\google_accounts.json"
    if (Test-Path $accountsFile) {
        try {
            $data = Get-Content $accountsFile -Raw | ConvertFrom-Json
            if ($data.active) {
                return $data.active
            }
        } catch { }
    }
    return "Antigravity User"
}

switch ($Action) {
    'status' {
        $proc = Get-RunningProcess
        $acc = Get-ActiveAntigravityAccount
        if ($proc) {
            Write-Host "Kantor Mari Partner: BERJALAN (PID: $($proc.Id))" -ForegroundColor Green
            Write-Host "  URL         : http://127.0.0.1:$Port/kerja" -ForegroundColor Cyan
            Write-Host "  Akun Aktif  : $acc" -ForegroundColor Yellow
        } else {
            Write-Host "Kantor Mari Partner: BERHENTI (port $Port bebas)" -ForegroundColor DarkGray
            Write-Host "  Akun Aktif  : $acc" -ForegroundColor Yellow
        }
    }

    'stop' {
        $proc = Get-RunningProcess
        if ($proc) {
            Stop-Process -Id $proc.Id -Force
            Remove-Item $PidFilePath -Force -ErrorAction SilentlyContinue
            Write-Host "Kantor Mari Partner (PID: $($proc.Id)) telah dihentikan." -ForegroundColor Green
        } else {
            Write-Host "Kantor Mari Partner tidak sedang berjalan pada port $Port." -ForegroundColor DarkGray
        }
    }

    'url' {
        Write-Host "http://127.0.0.1:$Port/kerja"
    }

    'restart' {
        & $PSCommandPath 'stop' -Port $Port
        Start-Sleep -Seconds 1
        & $PSCommandPath 'start' -Port $Port
    }

    'start' {
        $proc = Get-RunningProcess
        $acc = Get-ActiveAntigravityAccount
        if ($proc) {
            Write-Host "Kantor Mari Partner sudah berjalan (PID: $($proc.Id))." -ForegroundColor Yellow
            Write-Host "  URL        : http://127.0.0.1:$Port/kerja" -ForegroundColor Cyan
            Write-Host "  Akun Aktif : $acc" -ForegroundColor Green
            return
        }

        Write-Host "Menyalakan Kantor Mari Partner untuk Antigravity..." -ForegroundColor Cyan
        $env:KANTOR_PORT = $Port
        $env:KANTOR_PROJECT = $ScriptDir

        $p = Start-Process -FilePath "node" -ArgumentList "bin/serve-node.mjs" -WorkingDirectory $RuntimeDir -WindowStyle Hidden -PassThru
        Set-Content $PidFilePath $p.Id

        # Tunggu sampai port siap
        $ready = $false
        for ($i = 0; $i -lt 15; $i++) {
            Start-Sleep -Milliseconds 400
            $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
            if ($conn) {
                $ready = $true
                break
            }
        }

        if ($ready) {
            Write-Host "Kantor Mari Partner aktif!" -ForegroundColor Green
            Write-Host "  URL        : http://127.0.0.1:$Port/kerja" -ForegroundColor Cyan
            Write-Host "  Akun Aktif : $acc" -ForegroundColor Yellow
            Write-Host "  Hentikan   : .\kantor.ps1 stop" -ForegroundColor DarkGray
        } else {
            Write-Host "Server telah diluncurkan (PID: $($p.Id)). Coba buka: http://127.0.0.1:$Port/kerja" -ForegroundColor Yellow
        }
    }
}
