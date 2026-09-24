# Helper script to push latest frontend and backend to aadi-k-01 repositories
param(
  [string]$GithubToken = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SIH 2025 E-MANDI REPOSITORY PUSH UTILITY" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if ($GithubToken -ne "") {
  Write-Host "Pushing with provided GitHub Personal Access Token..." -ForegroundColor Green
  git push "https://$($GithubToken)@github.com/aadi-k-01/SIH_Frontend.git" frontend-deploy:main --force
  git push "https://$($GithubToken)@github.com/aadi-k-01/SIH_Backend.git" backend-deploy:main --force
} else {
  Write-Host "Attempting push using configured Git credentials..." -ForegroundColor Green
  Write-Host "Pushing frontend to https://github.com/aadi-k-01/SIH_Frontend.git ..."
  git push frontend-remote frontend-deploy:main
  Write-Host "Pushing backend to https://github.com/aadi-k-01/SIH_Backend.git ..."
  git push backend-remote backend-deploy:main
}

Write-Host "`nIf you encounter Permission 403 denied to 2500030266klu:" -ForegroundColor Yellow
Write-Host "Either:" -ForegroundColor White
Write-Host "  1. Add 2500030266klu as a Collaborator with write access to:" -ForegroundColor White
Write-Host "     https://github.com/aadi-k-01/SIH_Frontend/settings/access" -ForegroundColor Cyan
Write-Host "     https://github.com/aadi-k-01/SIH_Backend/settings/access" -ForegroundColor Cyan
Write-Host "  OR" -ForegroundColor White
Write-Host "  2. Run this script with a Personal Access Token (PAT) for aadi-k-01:" -ForegroundColor White
Write-Host "     .\push_to_repos.ps1 -GithubToken YOUR_GITHUB_PAT" -ForegroundColor Cyan
