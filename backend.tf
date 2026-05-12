terraform {
  backend "s3" {
    bucket         = "oshan-terraform-state-bucket-2026"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock-table"
    encrypt        = true
  }
}