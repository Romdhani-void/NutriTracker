param(
  [string[]]$Repos = @('nutritracker-mongo','nutritracker-backend','nutritracker-frontend'),
  [string]$Region = 'eu-central-1'
)

foreach ($repo in $Repos) {
  Write-Output "Checking repository: $repo"
  $images = aws ecr list-images --repository-name $repo --region $Region --query 'imageIds[*]' --output json 2>$null | ConvertFrom-Json
  if (-not $images -or $images.Count -eq 0) {
    Write-Output "No images in $repo"
    continue
  }
  # Delete images in batches
  $batch = @()
  foreach ($img in $images) {
    if ($img.imageDigest) { $batch += @{imageDigest=$img.imageDigest} }
    elseif ($img.imageTag) { $batch += @{imageTag=$img.imageTag} }
    if ($batch.Count -ge 100) {
      $json = ($batch | ConvertTo-Json -Depth 4)
      $tmp = New-TemporaryFile
      $json | Out-File -FilePath $tmp -Encoding utf8
      aws ecr batch-delete-image --repository-name $repo --region $Region --image-ids file://$tmp | Out-Null
      Remove-Item $tmp
      $batch = @()
    }
  }
  if ($batch.Count -gt 0) {
    $json = ($batch | ConvertTo-Json -Depth 4)
    $tmp = New-TemporaryFile
    $json | Out-File -FilePath $tmp -Encoding utf8
    aws ecr batch-delete-image --repository-name $repo --region $Region --image-ids file://$tmp | Out-Null
    Remove-Item $tmp
  }
  Write-Output "Cleared images for $repo"
}
