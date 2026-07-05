resource "aws_vpc" "main"{
    cidr_block = var.vpc_cidr
    enable_dns_support = true
    enable_dns_hostnames = true
    }

resource "aws_subnet" "public"{
    for_each = local.public_subnets
    vpc_id = aws_vpc.main.id
    cidr_block = each.value.cidr_block
    availability_zone = each.value.az

    tags = {
        name = "public-subnet-${each.key}"
        "kubernetes.io/cluster/${var.cluster_name}" = "shared"
        "kubernetes.io/role/elb" = "1"
    }
}

resource "aws_subnet" "private"{
    for_each = local.private_subnets
    vpc_id = aws_vpc.main.id
    cidr_block = each.value.cidr_block
    availability_zone = each.value.az

    tags = {
        name = "private-subnet-${each.key}"
        "kubernetes.io/cluster/${var.cluster_name}" = "shared"
        "kubernetes.io/role/internal-elb" = "1"

    }
}

resource "aws_subnet" "db"{
    for_each = local.db_subnets
    vpc_id = aws_vpc.main.id
    cidr_block = each.value.cidr_block
    availability_zone = each.value.az

    tags = {
        name = "db-subnet-${each.key}"
    }
}


resource "aws_internet_gateway" "gw"{
    vpc_id = aws_vpc.main.id
    tags ={
        Name = "main-gateway"
    }
}
resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.gw.id
    }
}
resource "aws_route_table_association" "public" {
    for_each = local.public_subnets_by_az
    subnet_id = aws_subnet.public[each.value].id
    route_table_id = aws_route_table.public.id
}


resource "aws_eip" "nat" {
    for_each = local.public_subnets_by_az
    domain = "vpc"
    tags = {
        name = "nat-eip-${each.key}"
    }
}
resource "aws_nat_gateway" "nat" {
    for_each = local.public_subnets_by_az
    allocation_id = aws_eip.nat[each.key].id
    subnet_id = aws_subnet.public[each.value].id
    tags = {
        name = "nat-gateway-${each.key}"
    }
    depends_on = [aws_internet_gateway.gw]
}

resource "aws_route_table" "private" {
    for_each = local.private_subnets_by_az
    vpc_id = aws_vpc.main.id

    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.nat[each.key].id
    }    
}
resource "aws_route_table_association" "private" {
    for_each = local.private_subnets_by_az
    subnet_id = aws_subnet.private[each.value].id
    route_table_id = aws_route_table.private[each.key].id
    }

resource "aws_route_table" "db" {
  for_each = local.db_subnets_by_az
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "db route table - ${each.key}"
  }
}
resource "aws_route_table_association" "db" {
  for_each = local.db_subnets_by_az
  subnet_id = aws_subnet.db[each.value].id
  route_table_id = aws_route_table.db[each.key].id
}