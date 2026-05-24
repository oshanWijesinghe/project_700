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


## 🏗️ Architecture & Workflow

### Phase 1: Infrastructure Provisioning (Terraform CI/CD)
1. **Automated IaC Pipeline:** On pushes to the `main` branch, GitHub Actions triggers the Terraform pipeline (`init`, `validate`, `plan`, and `apply`).
 <img width="1281" height="511" alt="Screenshot 2026-05-24 at 22 39 49" src="https://github.com/user-attachments/assets/8651258a-59bb-47f6-9cf3-c73a6f53142e" />


2. **Secure State Management:** The Terraform `.tfstate` is securely stored in an **AWS S3 bucket**, utilizing **DynamoDB for state locking** to prevent race conditions.

3. **Terraform Infrastructure Provisioning:** Architected and deployed a highly available AWS environment featuring a custom VPC, Internet Gateway, Route Tables, and multi-AZ public subnets to host EC2 compute instances managed by an Application Load Balancer (ALB) and Target Groups.

   <img width="633" height="597" alt="Screenshot 2026-05-24 at 22 40 36" src="https://github.com/user-attachments/assets/be092f82-41e2-415c-a7c8-b543ef5ab8ac" />




### Phase 2: Continuous Integration & Secure Trigger (GitHub Actions)
1. **Build & Push:** Code changes in `frontend` or `backend` trigger GitHub Actions to build their respective Docker images and push them to Docker Hub securely using stored credentials.
2. **Secure Execution via Bastion:** The pipeline  securely ssh and authenticate into a dedicated **Ansible Control Node (EC2 Bastion Host)**. thenn it execute the asible roles targetg production servers

   <img width="1520" height="753" alt="Screenshot 2026-05-24 at 22 38 52" src="https://github.com/user-attachments/assets/c56ef5ba-b947-444f-9295-0266d94d4090" />




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
  
   <img width="594" height="706" alt="Screenshot 2026-05-24 at 22 47 33" src="https://github.com/user-attachments/assets/9181e868-82bc-45a7-a154-c8dd46b66e50" />
   <img width="594" height="550" alt="Screenshot 2026-05-24 at 22 47 11" src="https://github.com/user-attachments/assets/87c6ffcc-43c5-4d6a-bfb5-0e8dd2ed1ef5" />



## 💡 Key Highlights & Achievements
* **Enterprise-Grade Infrastructure:** Designed a highly available, load-balanced AWS architecture managed entirely via Terraform with S3/DynamoDB state locking.
* **Modular Configuration:** Refactored flat Ansible playbooks into structured **Ansible Roles** for better reusability and maintainability.
* **Hardened Security:** Implemented a Control Node architecture with passwordless SSH key authentication, ensuring zero direct external access to application servers.
* **Automated Conflict Resolution:** Engineered the deployment tasks to automatically handle port bindings and forcefully clean up stubborn legacy containers for zero-conflict rollouts.
