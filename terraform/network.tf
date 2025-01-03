# vpc
resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "eks-vpc"
  }
}
# subnets
resource "aws_subnet" "subnet_1" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-west-3a"
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-1"
  }
}

resource "aws_subnet" "subnet_2" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "eu-west-3a"
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-2"
  }
}

resource "aws_subnet" "subnet_3" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "eu-west-3b"
  map_public_ip_on_launch = false
  tags = {
    Name = "private-subnet-1"
  }
}

resource "aws_subnet" "subnet_4" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = "eu-west-3b"
  map_public_ip_on_launch = false
  tags = {
    Name = "private-subnet-2"
  }
}
# internet gateway
resource "aws_internet_gateway" "internet_gw" {
  vpc_id = aws_vpc.vpc.id
}

# route tables
resource "aws_route_table" "public-rt" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gw.id
  }

  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = "local"
  }
}

resource "aws_route_table" "private-rt" {
  vpc_id = aws_vpc.vpc.id
  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = "local"
  }
}

# route table associations
resource "aws_route_table_association" "subnet_1_association" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.public-rt.id
}
resource "aws_route_table_association" "subnet_2_association" {
  subnet_id      = aws_subnet.subnet_2.id
  route_table_id = aws_route_table.public-rt.id
}

resource "aws_route_table_association" "subnet_3_association" {
  subnet_id      = aws_subnet.subnet_3.id
  route_table_id = aws_route_table.private-rt.id
}
resource "aws_route_table_association" "subnet_4_association" {
  subnet_id      = aws_subnet.subnet_4.id
  route_table_id = aws_route_table.private-rt.id
}
