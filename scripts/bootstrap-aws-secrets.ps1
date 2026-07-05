# Seeds AWS Secrets Manager entries for NutriTracker dev.
# Run once before applying ExternalSecret manifests.
#
# Required env vars (set in your shell or .env — never commit real values):
#   MONGO_ROOT_PASSWORD
#   SMTP_PASS
#
# Optional overrides:
#   AWS_REGION (default: eu-central-1)
#   MONGO_ROOT_USERNAME (default: admin)
#   SMTP_HOST, SMTP_PORT, SMTP_USER, EMAIL_FROM, TOKEN_EXPIRY_MINUTES

param(
    [string]$AwsRegion = $(if ($env:AWS_REGION) { $env:AWS_REGION } else { "eu-central-1" }),
    [string]$MongoRootUsername = $(if ($env:MONGO_ROOT_USERNAME) { $env:MONGO_ROOT_USERNAME } else { "admin" }),
    [string]$MongoRootPassword = $env:MONGO_ROOT_PASSWORD,
    [string]$SmtpHost = $(if ($env:SMTP_HOST) { $env:SMTP_HOST } else { "smtp.gmail.com" }),
    [string]$SmtpPort = $(if ($env:SMTP_PORT) { $env:SMTP_PORT } else { "587" }),
    [string]$SmtpUser = $env:SMTP_USER,
    [string]$SmtpPass = $env:SMTP_PASS,
    [string]$EmailFrom = $env:EMAIL_FROM,
    [string]$TokenExpiryMinutes = $(if ($env:TOKEN_EXPIRY_MINUTES) { $env:TOKEN_EXPIRY_MINUTES } else { "15" })
)

$ErrorActionPreference = "Stop"

if (-not $MongoRootPassword) {
    throw "MONGO_ROOT_PASSWORD is required."
}
if (-not $SmtpPass) {
    throw "SMTP_PASS is required."
}
if (-not $SmtpUser) {
    throw "SMTP_USER is required."
}
if (-not $EmailFrom) {
    $EmailFrom = $SmtpUser
}

function Set-AwsSecret {
    param(
        [string]$Name,
        [hashtable]$Payload
    )

    $json = ($Payload | ConvertTo-Json -Compress)
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tempFile, $json)
        $fileUri = "file://" + ($tempFile -replace '\\', '/')

        $prevErrorAction = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        aws secretsmanager describe-secret --secret-id $Name --region $AwsRegion 2>$null | Out-Null
        $secretExists = ($LASTEXITCODE -eq 0)
        $ErrorActionPreference = $prevErrorAction

        if ($secretExists) {
            Write-Host "Updating secret: $Name"
            aws secretsmanager put-secret-value `
                --secret-id $Name `
                --secret-string $fileUri `
                --region $AwsRegion | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Failed to update secret: $Name" }
            return
        }

        Write-Host "Creating secret: $Name"
        aws secretsmanager create-secret `
            --name $Name `
            --secret-string $fileUri `
            --region $AwsRegion | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Failed to create secret: $Name" }
    }
    finally {
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    }
}

$mongoUriBase = "mongodb://${MongoRootUsername}:${MongoRootPassword}@mongo:27017"

Set-AwsSecret -Name "nutritracker/dev/mongo" -Payload @{
    MONGO_INITDB_ROOT_USERNAME = $MongoRootUsername
    MONGO_INITDB_ROOT_PASSWORD = $MongoRootPassword
}

Set-AwsSecret -Name "nutritracker/dev/goal-service" -Payload @{
    PORT      = "3002"
    MONGO_URI = "$mongoUriBase/cozy-calories-goals?authSource=admin"
}

Set-AwsSecret -Name "nutritracker/dev/user-service" -Payload @{
    PORT                 = "3001"
    MONGO_URI            = "$mongoUriBase/cozy-calories-users?authSource=admin"
    TOKEN_EXPIRY_MINUTES = $TokenExpiryMinutes
    SMTP_HOST            = $SmtpHost
    SMTP_PORT            = $SmtpPort
    SMTP_USER            = $SmtpUser
    SMTP_PASS            = $SmtpPass
    EMAIL_FROM           = $EmailFrom
}

Set-AwsSecret -Name "nutritracker/dev/daily-log-service" -Payload @{
    PORT             = "3003"
    MONGO_URI        = "$mongoUriBase/cozy-calories-logs?authSource=admin"
    GOAL_SERVICE_URL = "http://goal-service:3002"
}

Write-Host "Done. Secrets created/updated under nutritracker/dev/* in $AwsRegion."
