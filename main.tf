resource "aws_vpc" "terraform_vpc" {
  cidr_block = var.cidr

  tags = {
    Name = "terraform_vpc"
  }
}

# 2 public subnets in different availability zones
resource "aws_subnet" "subnet_1" {
  vpc_id                  = aws_vpc.terraform_vpc.id
  cidr_block              = var.subnet_1_cidr
  availability_zone       = var.az_1
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet_1"
  }
}

resource "aws_subnet" "subnet_2" {
  vpc_id                  = aws_vpc.terraform_vpc.id
  cidr_block              = var.subnet_2_cidr
  availability_zone       = var.az_2
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet_2"
  }
}

# Internet gateway for the VPC
resource "aws_internet_gateway" "terraform_igw" {
  vpc_id = aws_vpc.terraform_vpc.id

  tags = {
    Name = "terraform_igw"
  }
}

# Route table for public subnets
resource "aws_route_table" "terraform_route_table" {
  vpc_id = aws_vpc.terraform_vpc.id

  # Where to send traffic, how to send traffic
  route {
    cidr_block = var.open_internet_cidr
    gateway_id = aws_internet_gateway.terraform_igw.id
  }

  tags = {
    Name = "terraform_route_table"
  }
}

# Route table associations for public subnets
resource "aws_route_table_association" "internet_to_public_subnets_1" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.terraform_route_table.id
}

resource "aws_route_table_association" "internet_to_public_subnets_2" {
  subnet_id      = aws_subnet.subnet_2.id
  route_table_id = aws_route_table.terraform_route_table.id
}

# Security group for ALB and EC2 instances
resource "aws_security_group" "terraform_sg" {
  description = "Allow security to ALB and EC2 instances"
  vpc_id      = aws_vpc.terraform_vpc.id

  tags = {
    Name = "terraform_sg"
  }
}

# Ingress rule to allow HTTP traffic
resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.terraform_sg.id
  cidr_ipv4         = var.open_internet_cidr
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

# Ingress rule to allow SSH traffic
resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.terraform_sg.id
  cidr_ipv4         = var.open_internet_cidr
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22
}

# Egress rule to allow all outbound traffic
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.terraform_sg.id
  cidr_ipv4         = var.open_internet_cidr
  ip_protocol       = "-1"
}

# Web Server 1
resource "aws_instance" "webserver1" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.terraform_sg.id]
  subnet_id              = aws_subnet.subnet_1.id

  tags = {
    Name = "webserver1"
  }
}

# Web Server 2
resource "aws_instance" "webserver2" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.terraform_sg.id]
  subnet_id              = aws_subnet.subnet_2.id

  tags = {
    Name = "webserver2"
  }
}

# AWS ALB for the web servers
resource "aws_lb" "terraform_alb" {
  name               = "terraform-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.terraform_sg.id]
  subnets            = [aws_subnet.subnet_1.id, aws_subnet.subnet_2.id]

  enable_deletion_protection = true

  tags = {
    Name = "terraform-alb"
  }
}

# AWS Target Group for the web servers
resource "aws_lb_target_group" "terraform_target_group" {
  name     = "terraform-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.terraform_vpc.id

  health_check {
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200-299"
    path                = "/"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "terraform_target_group"
  }
}

# Attach Web Server 1 to the Target Group
resource "aws_lb_target_group_attachment" "webserver1_attachment" {
  target_group_arn = aws_lb_target_group.terraform_target_group.arn
  target_id        = aws_instance.webserver1.id
  port             = 80
}

# Attach Web Server 2 to the Target Group
resource "aws_lb_target_group_attachment" "webserver2_attachment" {
  target_group_arn = aws_lb_target_group.terraform_target_group.arn
  target_id        = aws_instance.webserver2.id
  port             = 80
}

# AWS ALB Listener
resource "aws_lb_listener" "terraform_listener" {
  load_balancer_arn = aws_lb.terraform_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.terraform_target_group.arn
    type             = "forward"
  }
}