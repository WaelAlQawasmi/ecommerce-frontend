# Production build script for CommerceHub frontend
# Usage: .\scripts\build-production.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Set-Location $Root

Write-Host "==> CommerceHub production build" -ForegroundColor Cyan

# Ensure .env.production exists
if (-not (Test-Path ".env.production")) {
    if (Test-Path ".env.production.example") {
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "Created .env.production from .env.production.example" -ForegroundColor Yellow
        Write-Host "Edit .env.production with your production API URLs before deploying." -ForegroundColor Yellow
    } else {
        Write-Error ".env.production is missing. Create it with VITE_AUTH_API_URL and VITE_PRODUCTS_API_URL."
    }
}

Write-Host "==> Installing dependencies..." -ForegroundColor Cyan
npm ci 2>$null
if ($LASTEXITCODE -ne 0) {
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "==> Building for production..." -ForegroundColor Cyan
npm run build:prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "Output folder: $Root\dist" -ForegroundColor Green
Write-Host ""
Write-Host "Deploy the contents of dist/ to your web server (Apache, Nginx, S3, etc.)." -ForegroundColor Gray
Write-Host "Preview locally: npm run preview:prod" -ForegroundColor Gray
