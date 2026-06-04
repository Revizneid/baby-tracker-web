param(
    [string]$ProjectPath = ".",
    [string]$ProjectName = ""
)

$ErrorActionPreference = "SilentlyContinue"
$LINE = "-" * 60

function Write-Header($msg) {
    Write-Host ""
    Write-Host $LINE -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host $LINE -ForegroundColor Cyan
}
function Write-OK($msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-SKIP($msg) { Write-Host "  [skip] $msg" -ForegroundColor DarkGray }

$root = Resolve-Path $ProjectPath
if (-not $ProjectName) { $ProjectName = Split-Path $root -Leaf }

Write-Host ""
Write-Host $LINE -ForegroundColor Magenta
Write-Host "  IDE Session Persistence Setup" -ForegroundColor Magenta
Write-Host "  Project: $ProjectName ($root)" -ForegroundColor Magenta
Write-Host $LINE -ForegroundColor Magenta

# 
# FIX 1 - .gitignore (stop IDE indexing junk folders)
# Prevents re-index of node_modules, build output, etc.
# 
Write-Header "Fix 1 - .gitignore (stop indexing junk)"

$gitignorePath = Join-Path $root ".gitignore"
$gitignoreEntries = @(
    "# Dependencies",
    "node_modules/",
    ".pnp",
    ".pnp.js",
    "",
    "# Build output",
    "dist/",
    "build/",
    ".expo/",
    ".expo-shared/",
    "*.apk",
    "*.aab",
    "*.ipa",
    "",
    "# IDE & OS",
    ".DS_Store",
    "Thumbs.db",
    "*.suo",
    "*.user",
    "",
    "# Logs & temp",
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    ".yarn-integrity",
    "*.tmp",
    "*.temp",
    "",
    "# Test & coverage",
    "coverage/",
    ".nyc_output/",
    "",
    "# Env",
    ".env",
    ".env.local",
    ".env.*.local"
)

if (Test-Path $gitignorePath) {
    $existing = Get-Content $gitignorePath -Raw
    $toAdd = $gitignoreEntries | Where-Object {
        $_ -ne "" -and -not $_.StartsWith("#") -and $existing -notmatch [regex]::Escape($_)
    }
    if ($toAdd.Count -gt 0) {
        Add-Content -Path $gitignorePath -Value ("`n# Added by setup_ide_session`n" + ($toAdd -join "`n"))
        Write-OK "Added $($toAdd.Count) missing entries to existing .gitignore"
    } else {
        Write-SKIP ".gitignore already has all entries"
    }
} else {
    $gitignoreEntries | Set-Content -Path $gitignorePath -Encoding UTF8
    Write-OK "Created .gitignore"
}

# 
# FIX 2 - .vscode/settings.json
# - files.watcherExclude: stop file watcher hammering disk
# - files.exclude: hide junk from explorer
# - hot exit: remember unsaved state between sessions
# - restore windows: reopen tabs on next launch
# - search.exclude: skip indexing large dirs
# 
Write-Header "Fix 2 - .vscode/settings.json (watcher + hot exit)"

$vscodePath = Join-Path $root ".vscode"
if (-not (Test-Path $vscodePath)) {
    New-Item -ItemType Directory -Path $vscodePath | Out-Null
}
$settingsPath = Join-Path $vscodePath "settings.json"

$excludeGlobs = [ordered]@{
    "**/node_modules/**"    = $true
    "**/.expo/**"           = $true
    "**/.expo-shared/**"    = $true
    "**/dist/**"            = $true
    "**/build/**"           = $true
    "**/coverage/**"        = $true
    "**/.git/objects/**"    = $true
    "**/.git/subtree-cache/**" = $true
}

$settings = [ordered]@{
    "files.watcherExclude"          = $excludeGlobs
    "files.exclude"                 = [ordered]@{
        "**/.git"               = $true
        "**/node_modules"       = $true
        "**/.expo"              = $true
        "**/dist"               = $true
        "**/build"              = $true
    }
    "search.exclude"                = [ordered]@{
        "**/node_modules"       = $true
        "**/dist"               = $true
        "**/build"              = $true
        "**/.expo"              = $true
        "**/coverage"           = $true
    }
    "files.hotExit"                 = "onExitAndWindowClose"
    "window.restoreWindows"         = "folders"
    "workbench.editor.restoreViewState" = $true
    "editor.formatOnSave"           = $false
}

if (Test-Path $settingsPath) {
    $raw = Get-Content $settingsPath -Raw -Encoding UTF8
    $raw = $raw -replace '(?m)^\s*//[^\n]*', ''
    $raw = $raw -replace ',\s*([\}\]])', '$1'
    try   { $existing = $raw | ConvertFrom-Json -AsHashtable }
    catch { $existing = @{} }
    foreach ($k in $settings.Keys) {
        if (-not $existing.ContainsKey($k)) { $existing[$k] = $settings[$k] }
    }
    $json = $existing | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($settingsPath, $json, [System.Text.Encoding]::UTF8)
    Write-OK "Merged into existing .vscode/settings.json"
} else {
    $json = $settings | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($settingsPath, $json, [System.Text.Encoding]::UTF8)
    Write-OK "Created .vscode/settings.json"
}

# 
# FIX 3 - Workspace file (.code-workspace)
# Opening via workspace file makes VS Code/Antigravity IDE
# restore tabs, split editors, and terminal sessions.
# 
Write-Header "Fix 3 - $ProjectName.code-workspace (restore tabs)"

$workspacePath = Join-Path $root "$ProjectName.code-workspace"
if (-not (Test-Path $workspacePath)) {
    $workspace = [ordered]@{
        folders  = @(@{ path = "." })
        settings = [ordered]@{
            "files.hotExit"        = "onExitAndWindowClose"
            "window.restoreWindows" = "folders"
        }
    }
    $json = $workspace | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($workspacePath, $json, [System.Text.Encoding]::UTF8)
    Write-OK "Created $ProjectName.code-workspace"
    Write-Host "  NOTE: Always open project via this file to restore tabs" -ForegroundColor Yellow
} else {
    Write-SKIP "$ProjectName.code-workspace already exists"
}

# 
# FIX 4 - AI memory files
# CLAUDE.md    -> Claude Code / Anthropic tools
# .cursorrules -> Cursor
# .rules       -> Antigravity IDE (AG rules)
# Each file tells the AI: what is this project, tech stack,
# conventions - so it never asks again.
# 
Write-Header "Fix 4 - AI memory files (stop explaining codebase)"

$memoryContent = @"
# Project: $ProjectName

## Stack
- (fill in: e.g. React Native / Expo SDK 51 / TypeScript)
- (fill in: e.g. AsyncStorage for local persistence)
- (fill in: e.g. React Navigation - Drawer + Bottom Tabs)

## Structure
- src/screens/   - screen components
- src/components/ - shared UI components
- src/utils/     - helpers and constants
- assets/        - images, fonts

## Key conventions
- Use createStyles(theme) pattern for dark/light theme
- AsyncStorage keys prefixed with bt_
- Navigation: Drawer wraps Tab navigator

## What NOT to do
- Do not suggest adding a backend (local-only app)
- Do not rewrite existing working screens from scratch
- Do not add new dependencies without asking first

## Current focus
- (fill in what you are working on right now)
"@

$memoryFiles = @(
    @{ Name="CLAUDE.md";      Path=Join-Path $root "CLAUDE.md" }
    @{ Name=".cursorrules";   Path=Join-Path $root ".cursorrules" }
    @{ Name=".rules";         Path=Join-Path $root ".rules" }
)

foreach ($f in $memoryFiles) {
    if (-not (Test-Path $f.Path)) {
        [System.IO.File]::WriteAllText($f.Path, $memoryContent, [System.Text.Encoding]::UTF8)
        Write-OK "Created $($f.Name) -- edit with your actual stack details"
    } else {
        Write-SKIP "$($f.Name) already exists"
    }
}

# 
# SUMMARY
# 
Write-Host ""
Write-Host $LINE -ForegroundColor Magenta
Write-Host "  Done. Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "  1. Edit CLAUDE.md / .cursorrules / .rules with your actual stack" -ForegroundColor White
Write-Host "     (the template has placeholders for you to fill in)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. Always open project via workspace file:" -ForegroundColor White
Write-Host "     $workspacePath" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. First open after this setup will still re-index once." -ForegroundColor White
Write-Host "     After that: fast startup, tabs restored, AI remembers." -ForegroundColor DarkGray
Write-Host $LINE -ForegroundColor Magenta
Write-Host ""
