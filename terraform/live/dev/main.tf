terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
module "backend_ecr" {
  source = "../../modules/ecr"

  name                 = "${lower(var.project_name)}-backend"
  image_tag_mutability = var.image_tag_mutability
}
module "frontend_ecr" {
  source = "../../modules/ecr"

  name                 = "${lower(var.project_name)}-frontend"
  image_tag_mutability = var.image_tag_mutability
}
module "mongo_ecr" {
  source = "../../modules/ecr"

  name                 = "${lower(var.project_name)}-mongo"
  image_tag_mutability = var.image_tag_mutability
}

module "network" {
  source = "../../modules/network"

  cluster_name = var.cluster_name
  vpc_cidr     = var.vpc_cidr
  subnets      = var.subnets
  azs          = var.azs
}

module "iam" {
  source = "../../modules/iam"

  cluster_name = var.cluster_name
}

module "eks" {
  source = "../../modules/eks"

  cluster_name         = var.cluster_name
  eks_version          = var.eks_version
  cluster_role_arn     = module.iam.eks_cluster_role_arn
  eks_cluster_role_arn = module.iam.eks_cluster_role_arn

  private_subnet_ids = module.network.private_subnet_ids
  eks_node_role_arn  = module.iam.eks_node_group_role_arn

  eks_node_instance_types = var.eks_node_instance_types
  node_desired_size       = var.node_desired_size
  node_max_size           = var.node_max_size
  node_min_size           = var.node_min_size

  enable_ebs_csi_driver               = var.enable_ebs_csi_driver
  enable_aws_load_balancer_controller = var.enable_aws_load_balancer_controller

  depends_on = [module.iam]
}