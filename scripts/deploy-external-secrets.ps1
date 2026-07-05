# Installs External Secrets Operator and applies NutriTracker secret sync manifests.
# Prerequisites:
#   1. terraform apply (IRSA role created)
#   2. scripts/bootstrap-aws-secrets.ps1 (Secrets Manager populated)
#   3. kubectl configured for nutri-eks-cluster

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ValuesFile = Join-Path $RepoRoot "helm/controllers/external-secrets-values.yaml"

$RoleArn = terraform "-chdir=$(Join-Path $RepoRoot 'terraform/live/dev')" output -raw external_secrets_role_arn 2>$null
if (-not $RoleArn) {
    throw "Could not read external_secrets_role_arn from Terraform. Run terraform apply first."
}

helm repo add external-secrets https://charts.external-secrets.io 2>$null
helm repo update

helm upgrade --install external-secrets external-secrets/external-secrets `
    --namespace external-secrets `
    --create-namespace `
    -f $ValuesFile `
    --set "serviceAccount.annotations.eks\.amazonaws\.com/role-arn=$RoleArn"

Write-Host "Waiting for External Secrets CRDs..."
kubectl wait --for=condition=Established crd/clustersecretstores.external-secrets.io --timeout=120s
kubectl wait --for=condition=Established crd/externalsecrets.external-secrets.io --timeout=120s
kubectl wait --for=condition=Available deployment/external-secrets -n external-secrets --timeout=120s

kubectl create namespace nutri-track --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f (Join-Path $RepoRoot "helm/controllers/cluster-secret-store.yaml")
kubectl apply -f (Join-Path $RepoRoot "helm/controllers/external-secrets/")

Write-Host "Waiting for ExternalSecrets to sync..."
kubectl wait --for=condition=Ready externalsecret --all -n nutri-track --timeout=120s

Write-Host "External Secrets stack is ready."
