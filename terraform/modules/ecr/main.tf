resource "aws_ecr_repository" "main" {
  
  name                 = var.name
  image_tag_mutability = var.image_tag_mutability
  tags = var.tags
}