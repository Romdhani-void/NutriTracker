output "external_secrets_role_arn" {
  description = "IAM role ARN for External Secrets Operator (annotate ESO service account)"
  value       = module.eks.external_secrets_role_arn
}

output "aws_load_balancer_controller_role_arn" {
  description = "IAM role ARN for AWS Load Balancer Controller"
  value       = module.eks.aws_load_balancer_controller_role_arn
}