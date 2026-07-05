locals {
    public_subnets ={
        for i, k in var.subnets : "public subnet-${i+1}" => {
            cidr_block = k.cidr_block
            az = var.azs[i%length(var.azs)]
        } if k.role == "public"
    }
}

locals {
    private_subnets = {
        for i, k in var.subnets : "private subnet-${i+1}" => {
            cidr_block = k.cidr_block
            az = var.azs[i%length(var.azs)]
        }if k.role == "private"
    }
}

locals {
    db_subnets = {
        for i, k in var.subnets : "db subnet-${i+1}" => {
            cidr_block = k.cidr_block
            az = var.azs[i%length(var.azs)]
        }if k.role == "db"
    }
}

locals {
    public_subnets_by_az = {
        for i, k in aws_subnet.public : 
        k.availability_zone => i
    }

    private_subnets_by_az = {
        for i, k in aws_subnet.private : 
        k.availability_zone => i
    }

    db_subnets_by_az = {
        for i, k in aws_subnet.db : 
        k.availability_zone => i
    }
}