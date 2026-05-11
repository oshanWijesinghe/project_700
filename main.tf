resource "aws_vpc" "terraform_vpc" {
  cidr_block = var.cidr

  tags = {
    Name = "terraform_vpc"
  }
}

resource "aws_subnet" "subnet_1" {

  vpc_id     = aws_vpc.terraform_vpc.id
  cidr_block = "10.0.1.0/24"
  tags = {
    Name = "terraform_subnet_1"
  }
}


resource "aws_subnet" "subnet_2" {
  vpc_id     = aws_vpc.terraform_vpc.id
  cidr_block = "10.0.2.0/24"
  tags = {
    Name = "terraform_subnet_2"
  }
}
