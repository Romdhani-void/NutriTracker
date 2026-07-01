variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
}

variable "project_name" {
  description = "The name of the ECR repository"
  type        = string
}

variable "image_tag_mutability" {
  description = "The tag mutability setting for the ECR repository"
  type        = string
  default     = "MUTABLE"
}

variable "tags" {
  description = "A map of tags to assign to the resource"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "subnets" {
  description = "List of subnets to create"
  type = list(object({
    cidr_block = string
    role       = string
  }))
}

variable "azs" {
  description = "List of availability zones to use"
  type        = list(string)
}

variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
}

variable "eks_version" {
  description = "The version of the EKS cluster"
  type        = string
}

variable "eks_node_instance_types" {
  description = "List of instance types for the EKS node group"
  type        = list(string)
}

variable "node_desired_size" {
  description = "The desired size of the EKS node group"
  type        = number
}

variable "node_max_size" {
  description = "The maximum size of the EKS node group"
  type        = number
}

variable "node_min_size" {
  description = "The minimum size of the EKS node group"
  type        = number
}

variable "enable_ebs_csi_driver" {
  description = "Whether to enable the EBS CSI driver"
  type        = bool
  default     = true
}

variable "enable_aws_load_balancer_controller" {
  description = "Whether to enable the AWS Load Balancer Controller"
  type        = bool
}