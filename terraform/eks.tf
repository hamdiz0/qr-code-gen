module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "qr-code-generator"
  cluster_version = "1.31"

  cluster_endpoint_public_access = true

  vpc_id                   = aws_vpc.vpc.id
  subnet_ids               = [aws_subnet.subnet_1.id, aws_subnet.subnet_2.id, aws_subnet.subnet_3.id,aws_subnet.subnet_4.id]
  control_plane_subnet_ids = [aws_subnet.subnet_1.id, aws_subnet.subnet_2.id, aws_subnet.subnet_3.id,aws_subnet.subnet_4.id]

  eks_managed_node_groups = {
    green = {
      min_size       = 1
      max_size       = 1
      desired_size   = 1
      instance_types = ["t3.medium"]
    }
  }
}



