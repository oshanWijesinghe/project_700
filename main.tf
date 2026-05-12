resource "aws_vpc" "terraform_vpc" {
  cidr_block = var.cidr

  tags = {
    Name = "terraform_vpc"
  }
}

#public subnets

resource "aws_subnet" "subnet_1" {

  vpc_id                  = aws_vpc.terraform_vpc.id
  cidr_block              = var.subnet_1_cidr
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet_1"
  }
}

#second public subnet in a different availability zone for high availability

resource "aws_subnet" "subnet_2" {
  vpc_id                  = aws_vpc.terraform_vpc.id
  cidr_block              = var.subnet_2_cidr
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet_2"
  }
}

#internet gateway for the VPC

resource "aws_internet_gateway" "terraform_igw" {
  vpc_id = aws_vpc.terraform_vpc.id

  tags = {
    Name = "terraform_igw"
  }
}

#route table for public subnets

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

#route table associations for public subnets

resource "aws_route_table_association" "internet_to_public_subnets_2" {
  subnet_id      = aws_subnet.subnet_2.id
  route_table_id = aws_route_table.terraform_route_table.id
}

resource "aws_route_table_association" "internet_to_public_subnets_1" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.terraform_route_table.id
}




#security group for ALB and EC2 instances

resource "aws_security_group" "terraform_sg" {
  name        = "terraform_sg"
  description = "Allow security to ALB and EC2 instances"
  vpc_id      = aws_vpc.terraform_vpc.id

  tags = {
    Name = "terraform_sg"
  }
}

#ingress rule to allow HTTP traffic from the VPC CIDR block to the security group
resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.terraform_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

#ingress rule to allow SSH traffic from the VPC CIDR block to the security group
resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.terraform_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22
}



#egress rule to allow all outbound traffic from the security group to the VPC CIDR block 
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.terraform_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}



#s3 original bucket creation
resource "aws_s3_bucket" "oshan-s3bucket-terraform" {
  bucket = "oshans3bucketterraform"

  tags = {
    Name = "oshan-s3bucket-terraform"
  }
}

# 2. Turn off  "Block Public Access" security settings
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.oshan-s3bucket-terraform.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 3. Attach a Bucket Policy to allow public read access
resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.oshan-s3bucket-terraform.id

  # This tells Terraform to wait until the public access blocks are removed 
  # before trying to apply this policy, avoiding errors.
  depends_on = [aws_s3_bucket_public_access_block.public_access]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.oshan-s3bucket-terraform.arn}/*"
      }
    ]
  })
}


resource "aws_instance" "webserver1" {
  ami                    = "ami-091138d0f0d41ff90"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.terraform_sg.id]
  subnet_id              = aws_subnet.subnet_1.id
  user_data              = file("userdata.sh")

  tags = {
    Name = "webserver1"
  }
}

resource "aws_instance" "webserver2" {
  ami                    = "ami-091138d0f0d41ff90"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.terraform_sg.id]
  subnet_id              = aws_subnet.subnet_2.id
  user_data              = file("userdata.sh")

  tags = {
    Name = "webserver2"
  }
}

#aws_lb for the web servers
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


#aws target group for the web servers
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


#attach the web servers1 to the target group
resource "aws_lb_target_group_attachment" "webserver1_attachment" {
  target_group_arn = aws_lb_target_group.terraform_target_group.arn
  target_id        = aws_instance.webserver1.id
  port             = 80
}

#attach the web servers2 to the target group
resource "aws_lb_target_group_attachment" "webserver2_attachment" {
  target_group_arn = aws_lb_target_group.terraform_target_group.arn
  target_id        = aws_instance.webserver2.id
  port             = 80
}



#aws_lb_listener for the ALB
resource "aws_lb_listener" "terraform_listener" {
  load_balancer_arn = aws_lb.terraform_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.terraform_target_group.arn
    type             = "forward"
  }
}


output "loadbalancerdns" {
  value = aws_lb.terraform_alb.dns_name
}