# Single Executable Application Build Script for JAKUTEN STORE
# This script builds a standalone executable using Node.js SEA (Single Executable Application)

$ErrorActionPreference = "Stop"

Write-Host "Building JAKUTEN STORE as Single Executable Application..." -ForegroundColor Green

# Step 0: Bundle with webpack
Write-Host "`nStep 0: Bundling with webpack..." -ForegroundColor Cyan
npx webpack
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to bundle with webpack" -ForegroundColor Red
    exit 1
}

# Step 1: Generate sea-config.json with all files
Write-Host "`nStep 1: Generating sea-config.json..." -ForegroundColor Cyan
node generate-sea-config.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate sea-config.json" -ForegroundColor Red
    exit 1
}

# Step 2: Generate sea-prep.blob
Write-Host "`nStep 2: Generating sea-prep.blob..." -ForegroundColor Cyan
node --experimental-sea-config sea-config.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate sea-prep.blob" -ForegroundColor Red
    exit 1
}

# Step 3: Copy node executable
Write-Host "`nStep 3: Copying node executable..." -ForegroundColor Cyan
$nodePath = (Get-Command node).Source
Copy-Item $nodePath -Destination "jakuten-store.exe" -Force
Write-Host "Copied from: $nodePath"

# Step 4: Remove signature (Windows only)
Write-Host "`nStep 4: Removing signature..." -ForegroundColor Cyan
try {
    $signtool = Get-Command signtool -ErrorAction SilentlyContinue
    if ($signtool) {
        & signtool remove /s jakuten-store.exe 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "No signature to remove" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Signtool not found, skipping signature removal" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Skipping signature removal" -ForegroundColor Yellow
}

# Step 5: Inject SEA blob
Write-Host "`nStep 5: Injecting SEA blob into executable..." -ForegroundColor Cyan
try {
    npx postject jakuten-store.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
} catch {
    Write-Host "Error: Failed to inject SEA blob. Make sure postject is installed:" -ForegroundColor Red
    Write-Host "  npm install -g postject" -ForegroundColor Red
    exit 1
}

# Step 6: Sign executable (optional)
Write-Host "`nStep 6: Signing executable..." -ForegroundColor Cyan
try {
    $signtool = Get-Command signtool -ErrorAction SilentlyContinue
    if ($signtool) {
        Write-Host "Signing skipped (no certificate configured)" -ForegroundColor Yellow
        # Uncomment the following line if you have a code signing certificate:
        # & signtool sign /fd SHA256 jakuten-store.exe
    } else {
        Write-Host "Signtool not found, skipping signing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Skipping signing" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "Executable created: jakuten-store.exe" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "`nTo run the application:"
Write-Host "  .\jakuten-store.exe"
Write-Host "`nThe application will create db.sqlite in the current directory on first run."
