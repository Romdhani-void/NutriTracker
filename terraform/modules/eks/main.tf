resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = var.eks_cluster_role_arn
  version  = var.eks_version

  vpc_config {
    subnet_ids = var.private_subnet_ids
  }
}

resource "aws_eks_node_group" "main" {
    cluster_name = aws_eks_cluster.main.name
    node_group_name = "${var.cluster_name}-node-group"
    node_role_arn = var.eks_node_role_arn
    subnet_ids = var.private_subnet_ids
    instance_types = var.eks_node_instance_types

    scaling_config {
        desired_size = var.node_desired_size    
        max_size     = var.node_max_size
        min_size     = var.node_min_size
    }

    depends_on = [aws_eks_cluster.main]
}

// OIDC
data "tls_certificate" "eks_oidc" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}
resource "aws_iam_openid_connect_provider" "eks" {
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint]
}





// IRSA for ALB Ingress Controller
resource "aws_iam_role" "aws_load_balancer_controller" {
  count = var.enable_aws_load_balancer_controller ? 1 : 0

  name = "${var.cluster_name}-aws-load-balancer-controller-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRoleWithWebIdentity"

        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }

        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "aws_load_balancer_controller" {
  count = var.enable_aws_load_balancer_controller ? 1 : 0

  name        = "${var.cluster_name}-aws-load-balancer-controller-policy"
  description = "IAM policy for AWS Load Balancer Controller"

  policy = file("${path.module}/aws-load-balancer-controller-policy.json")
}
resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  count      = var.enable_aws_load_balancer_controller ? 1 : 0
  policy_arn = aws_iam_policy.aws_load_balancer_controller[0].arn
  role       = aws_iam_role.aws_load_balancer_controller[0].name
}




// IRSA for EBS CSI Driver
resource "aws_iam_role" "ebs_csi_driver" {
  count = var.enable_ebs_csi_driver ? 1 : 0
  name = "${var.cluster_name}-ebs-csi-driver-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}
resource "aws_iam_role_policy_attachment" "ebs_csi_driver" {
  count      = var.enable_ebs_csi_driver ? 1 : 0
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.ebs_csi_driver[0].name
}
resource "aws_eks_addon" "ebs_csi_driver" {
  count = var.enable_ebs_csi_driver ? 1 : 0

  cluster_name             = aws_eks_cluster.main.name
  addon_name               = "aws-ebs-csi-driver"
  service_account_role_arn = aws_iam_role.ebs_csi_driver[0].arn

  depends_on = [
    aws_eks_node_group.main,
    aws_iam_role_policy_attachment.ebs_csi_driver
  ]
}

// IRSA for External Secrets Operator
data "aws_caller_identity" "current" {}

resource "aws_iam_role" "external_secrets" {
  count = var.enable_external_secrets ? 1 : 0
  name  = "${var.cluster_name}-external-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRoleWithWebIdentity"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:external-secrets:external-secrets"
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "external_secrets" {
  count = var.enable_external_secrets ? 1 : 0

  name        = "${var.cluster_name}-external-secrets-policy"
  description = "Allow External Secrets Operator to read Secrets Manager secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.secrets_manager_name_prefix}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "external_secrets" {
  count      = var.enable_external_secrets ? 1 : 0
  policy_arn = aws_iam_policy.external_secrets[0].arn
  role       = aws_iam_role.external_secrets[0].name
}