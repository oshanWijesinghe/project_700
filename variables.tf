variable "cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_1_cidr" {
  description = "The CIDR block for public subnet 1"
  type        = string
  default     = "10.0.1.0/24"
}

variable "subnet_2_cidr" {
  description = "The CIDR block for public subnet 2"
  type        = string
  default     = "10.0.2.0/24"
}

variable "az_1" {
  description = "Availability Zone for subnet 1"
  type        = string
  default     = "us-east-1a"
}

variable "az_2" {
  description = "Availability Zone for subnet 2"
  type        = string
  default     = "us-east-1b"
}

variable "ami_id" {
  description = "AMI ID for the web server instances"
  type        = string
  default     = "ami-091138d0f0d41ff90"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "open_internet_cidr" {
  description = "CIDR block representing the open internet"
  type        = string
  default     = "0.0.0.0/0"
}