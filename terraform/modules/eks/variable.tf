variable "cluster_name"{
    description = "The name of the EKS cluster"
    type        = string
}

variable "cluster_role_arn" {
  type = string
}

variable "eks_version"{
    description = "The version of the EKS cluster"
    type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "eks_node_role_arn" {
  description = "The ARN of the IAM role for the EKS node group"
  type        = string
}

variable "eks_node_instance_types" {
  description = "List of instance types for the EKS node group"
  type        = list(string)
}

variable "node_desired_size"{
    description = "The desired size of the EKS node group"
    type        = number
}

variable "eks_cluster_role_arn"{
    description = "The ARN of the IAM role for the EKS cluster"
    type        = string
}

variable "node_max_size"{
    description = "The maximum size of the EKS node group"
    type        = number
}

variable "node_min_size"{
    description = "The minimum size of the EKS node group"
    type        = number
}

variable "enable_ebs_csi_driver" {
  description = "Whether to enable the EBS CSI driver"
  type        = bool
}

variable "enable_aws_load_balancer_controller" {
  description = "Whether to enable the AWS Load Balancer Controller"
  type        = bool
}

variable "enable_external_secrets" {
  description = "Whether to create IRSA for External Secrets Operator"
  type        = bool
  default     = false
}

variable "aws_region" {
  description = "AWS region (used in Secrets Manager IAM policy scope)"
  type        = string
}

variable "secrets_manager_name_prefix" {
  description = "Prefix for Secrets Manager secret names ESO is allowed to read"
  type        = string
  default     = "nutritracker/dev"
}