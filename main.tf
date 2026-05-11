resource "aws_vpc" "terraform_vpc" {
  cidr_block = var.cidr

  tags = {
    Name = "terraform_vpc"
  }
}

resource "aws_subnet" "subnet_1" {

  vpc_id                  = aws_vpc.terraform_vpc.id
  cidr_block              = var.subnet_1_cidr
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet_1"
  }
}


resource "aws_subnet" "subnet_2" {
  vpc_id                  = aws_vpc.terraform_vpc.id
  cidr_block              = var.subnet_2_cidr
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet_2"
  }
}


resource "aws_internet_gateway" "terraform_igw" {
  vpc_id = aws_vpc.terraform_vpc.id

  tags = {
    Name = "terraform_igw"
  }
}



resource "aws_route_table" "terraform_route_table" {
  vpc_id = aws_vpc.terraform_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.terraform_igw.id
  }

  tags = {
    Name = "terraform_route_table"
  }
}


resource "aws_route_table_association" "internet_to_public_subnets_2" {
  subnet_id      = aws_subnet.subnet_2.id
  route_table_id = aws_route_table.terraform_route_table.id
}

resource "aws_route_table_association" "internet_to_public_subnets_1" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.terraform_route_table.id
}


