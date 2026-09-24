# Helper script to sync and push latest frontend and backend to aadi-k-01 repositories
param(
  [string]$GithubToken = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SIH 2025 E-MANDI REPOSITORY PUSH & SYNC UTILITY" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Update subtree split branches for frontend and backend
Write-Host "`n[1/3] Splitting frontend and backend subtrees from main..." -ForegroundColor Green
git subtree split --prefix=frontend -b frontend-deploy-tmp
if ($LASTEXITCODE -eq 0) {
  git branch -f frontend-deploy frontend-deploy-tmp
  git branch -D frontend-deploy-tmp
  Write-Host "✓ frontend-deploy branch updated." -ForegroundColor Green
}

git subtree split --prefix=backend -b backend-deploy-tmp
if ($LASTEXITCODE -eq 0) {
  git branch -f backend-deploy backend-deploy-tmp
  git branch -D backend-deploy-tmp
  Write-Host "✓ backend-deploy branch updated." -ForegroundColor Green
}

# 2. Push to remotes
Write-Host "`n[2/3] Pushing to deployment repositories..." -ForegroundColor Green
if ($GithubToken -ne "") {
  Write-Host "Pushing using provided GitHub Personal Access Token..." -ForegroundColor Green
  $frontendUrl = "https://x-access-token:$($GithubToken)@github.com/aadi-k-01/SIH_Frontend.git"
  $backendUrl = "https://x-access-token:$($GithubToken)@github.com/aadi-k-01/SIH_Backend.git"
  
  Write-Host "Pushing frontend to https://github.com/aadi-k-01/SIH_Frontend.git ..."
  git -c credential.helper= push $frontendUrl frontend-deploy:main --force
  
  Write-Host "Pushing backend to https://github.com/aadi-k-01/SIH_Backend.git ..."
  git -c credential.helper= push $backendUrl backend-deploy:main --force
} else {
  Write-Host "Attempting push using configured Git credentials..." -ForegroundColor Green
  Write-Host "Pushing frontend to https://github.com/aadi-k-01/SIH_Frontend.git ..."
  git push frontend-remote frontend-deploy:main --force
  Write-Host "Pushing backend to https://github.com/aadi-k-01/SIH_Backend.git ..."
  git push backend-remote backend-deploy:main --force
}

Write-Host "`n[3/3] Status & Troubleshooting:" -ForegroundColor Cyan
Write-Host "If you encounter '403 Forbidden' or 'Resource not accessible by personal access token':" -ForegroundColor Yellow
Write-Host "1. For Classic Token (Easiest):" -ForegroundColor White
Write-Host "   Generate at https://github.com/settings/tokens/new with 'repo' scope checked." -ForegroundColor White
Write-Host "2. For Fine-Grained Token (github_pat_...):" -ForegroundColor White
Write-Host "   In token settings -> Repository Permissions -> set 'Contents' to 'Read and write'." -ForegroundColor White
Write-Host "3. Or add '2500030266klu' as Collaborator with Write access at:" -ForegroundColor White
Write-Host "   https://github.com/aadi-k-01/SIH_Frontend/settings/access" -ForegroundColor Cyan
Write-Host "   https://github.com/aadi-k-01/SIH_Backend/settings/access`n" -ForegroundColor Cyan

