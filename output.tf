output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.terraform_vpc.id
}

output "subnet_1_id" {
  description = "ID of subnet 1"
  value       = aws_subnet.subnet_1.id
}

output "subnet_2_id" {
  description = "ID of subnet 2"
  value       = aws_subnet.subnet_2.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.terraform_vpc.cidr_block
}