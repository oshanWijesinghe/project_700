# 🚀 Automated Cloud Infrastructure & CI/CD Pipeline for E-Commerce Application

## 📌 Project Overview
This project demonstrates a complete end-to-end DevOps lifecycle for an E-Commerce application. It features automated Infrastructure as Code (IaC) to provision a highly available AWS environment, paired with a secure, automated CI/CD pipeline. The architecture utilizes a Bastion Host (Control Node) pattern and modular Ansible Roles for zero-downtime, secure containerized deployments.

## 🛠️ Tech Stack & Tools
* **Infrastructure as Code (IaC):** Terraform
* **State Management:** AWS S3 (Remote State) & Amazon DynamoDB (State Locking)
* **Cloud Provider (AWS):** VPC, EC2, Application Load Balancer (ALB), Target Groups, Route Tables, IGW, S3
* **CI/CD Platforms:** GitHub Actions
* **Configuration Management:** Ansible (Using Ansible Roles)
* **Containerization:** Docker, Docker Compose, Docker Hub
* **Security:** SSH Keygen (Passwordless Login), GitHub Secrets, Strict Security Groups

## 🏗️ Architecture & Workflow

### Phase 1: Infrastructure Provisioning (Terraform CI/CD)
1. **Automated IaC Pipeline:** On pushes to the `main` branch, GitHub Actions triggers the Terraform pipeline (`init`, `validate`, `plan`, and `apply`).
2. **Secure State Management:** The Terraform `.tfstate` is securely stored in an **AWS S3 bucket**, utilizing **DynamoDB for state locking** to prevent race conditions.
3. **High Availability Networking:** Provisions a custom VPC, Internet Gateway, Route Tables, and public subnets across multiple Availability Zones.
4. **Load Balancing & Compute:** Deploys EC2 instances into the subnets, sitting behind an **Application Load Balancer (ALB)** configured with Target Groups.
   

 <img width="1251" height="423" alt="terrafrom setup drawio (1)" src="https://github.com/user-attachments/assets/f852c58f-b4f3-489e-83de-2a36f69cc062" />



### Phase 2: Continuous Integration & Secure Trigger (GitHub Actions)
1. **Build & Push:** Code changes in `frontend` or `backend` trigger GitHub Actions to build their respective Docker images and push them to Docker Hub securely using stored credentials.
2. **Secure Execution via Bastion:** The pipeline uses the `appleboy/ssh-action` to securely authenticate into a dedicated **Ansible Control Node (EC2 Bastion Host)**. GitHub Actions never interacts directly with the production servers.

### Phase 3: Configuration Management & Orchestration (Ansible)
1. **Passwordless SSH Authentication:** The Control Node is configured with SSH keys (`ssh-keygen`) injected into the target production EC2 instances (`authorized_keys`), allowing seamless and highly secure passwordless communication.
2. **Modular Ansible Roles:** The deployment logic is structured using **Ansible Roles** (e.g., a dedicated `docker` role containing `tasks`, `templates`, `vars`, etc.) to ensure modularity, scalability, and clean code.
3. **Task Execution (`main.yml`):** The Ansible playbook dynamically executes the following on target nodes:
   * Installs and configures Docker and Docker Compose.
   * Creates application directories and sets proper ownership.
   * Injects environment variables and dynamically templates the `docker-compose.yml` file (`.j2`).
   * Pulls the latest Docker images from Docker Hub.
   * Safely stops and forcefully removes any orphaned, stubborn, or conflicting legacy containers.
   * Frees up required network ports by aggressively stopping default host services (Nginx/Apache).
   * Spins up the new application containers using `docker compose up -d`.

## 💡 Key Highlights & Achievements
* **Enterprise-Grade Infrastructure:** Designed a highly available, load-balanced AWS architecture managed entirely via Terraform with S3/DynamoDB state locking.
* **Modular Configuration:** Refactored flat Ansible playbooks into structured **Ansible Roles** for better reusability and maintainability.
* **Hardened Security:** Implemented a Control Node architecture with passwordless SSH key authentication, ensuring zero direct external access to application servers.
* **Automated Conflict Resolution:** Engineered the deployment tasks to automatically handle port bindings and forcefully clean up stubborn legacy containers for zero-conflict rollouts.
