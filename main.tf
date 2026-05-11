provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "my_test_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Oshan-Test-VPC"
  }
}