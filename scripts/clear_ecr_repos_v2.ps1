param(
  [string[]]$Repos = @('nutritracker-mongo','nutritracker-backend','nutritracker-frontend'),
  [string]$Region = 'eu-central-1'
)

foreach ($repo in $Repos) {
  Write-Output "Checking repository: $repo"
  $digests = aws ecr list-images --repository-name $repo --region $Region --query 'imageIds[*].imageDigest' --output text 2>$null
  if (-not $digests) { Write-Output "No images in $repo"; continue }
  $arr = $digests -split "\s+"
  foreach ($d in $arr) {
    if ([string]::IsNullOrWhiteSpace($d)) { continue }
    Write-Output "Deleting $d from $repo"
    aws ecr batch-delete-image --repository-name $repo --region $Region --image-ids imageDigest=$d | Out-Null
  }
  Write-Output "Cleared images for $repo"
}
