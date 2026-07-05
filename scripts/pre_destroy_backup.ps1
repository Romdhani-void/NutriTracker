$ts = (Get-Date -Format 'yyyyMMddHHmmss')
$backup = "backups/pre-destroy-$ts"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
Write-Output "Backing up helm/ to $backup"
if (Test-Path -Path 'helm') { Compress-Archive -Path 'helm' -DestinationPath "$backup/helm.zip" -Force }
else { Write-Output "No helm directory found, skipping helm backup." }
Write-Output "Backing up terraform/live/dev/ to $backup"
if (Test-Path -Path 'terraform\live\dev') { Compress-Archive -Path 'terraform\live\dev' -DestinationPath "$backup/terraform-dev.zip" -Force }
else { Write-Output "No terraform/live/dev directory found, skipping terraform dev backup." }
Write-Output "Backup completed: $backup"
