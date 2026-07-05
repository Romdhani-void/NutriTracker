try {
  $releasesJson = & helm list --all-namespaces -o json 2>$null
} catch {
  Write-Output "helm not available or failed to list releases."
  exit 1
}
if (-not $releasesJson) {
  Write-Output "No helm releases found or helm command failed."
  exit 0
}
$releases = $releasesJson | ConvertFrom-Json
$matches = $releases | Where-Object { $_.chart -like "*nutri-track*" -or $_.name -like "*nutri*" -or ($_.chart -match "nutri") }
if (-not $matches) {
  Write-Output "No matching releases to uninstall."
  exit 0
}
foreach ($r in $matches) {
  Write-Output "Uninstalling $($r.name) in namespace $($r.namespace)"
  helm uninstall $r.name -n $r.namespace
}
