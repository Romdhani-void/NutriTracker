output "vpc_id" {
    value = aws_vpc.main.id
}

output "public_subnet_ids" {
    description = "List of public subnet IDs"
    value = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
    description = "List of private subnet IDs"
    value = [for subnet in aws_subnet.private : subnet.id]
}

output "db_subnet_ids" {
    description = "List of database subnet IDs"
    value = [for subnet in aws_subnet.db : subnet.id]
}