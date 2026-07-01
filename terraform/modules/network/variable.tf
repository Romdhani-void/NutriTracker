variable "vpc_cidr"{
    description = "The CIDR block for the VPC"
    type = string
}

variable "subnets"{
    description = "List of subnets to create"
    type = list(object({
        cidr_block = string
        role = string
    }))
}

variable "azs"{
    description = "List of availability zones to use"
    type = list(string)
}

variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
}