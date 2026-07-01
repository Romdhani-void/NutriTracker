aws_region           = "eu-central-1"
project_name         = "nutritracker"
environment          = "dev"
image_tag_mutability = "IMMUTABLE"

vpc_cidr = "10.0.0.0/16"
subnets = [
  {
    cidr_block = "10.0.1.0/24"
    role       = "public"
  },
  {
    cidr_block = "10.0.11.0/24"
    role       = "public"
  },
  {
    cidr_block = "10.0.2.0/24"
    role       = "private"
  },
  {
    cidr_block = "10.0.21.0/24"
    role       = "private"
  },
  {
    cidr_block = "10.0.3.0/24"
    role       = "db"
  },
  {
    cidr_block = "10.0.31.0/24"
    role       = "db"
  },
]

azs = ["eu-central-1a", "eu-central-1b"]

cluster_name                        = "nutri-eks-cluster"
eks_version                         = "1.33"
eks_node_instance_types             = ["t3.small"]
node_desired_size                   = 2
node_max_size                       = 3
node_min_size                       = 1
enable_ebs_csi_driver               = true
enable_aws_load_balancer_controller = true