# 🚀 Production Deployment Guide

Complete guide for deploying the Indian Government Q&A System to production for All India scale.

---

## Table of Contents

1. [Infrastructure Requirements](#infrastructure-requirements)
2. [AWS Deployment (Recommended)](#aws-deployment)
3. [Alternative Platforms](#alternative-platforms)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Scaling Strategy](#scaling-strategy)
7. [Disaster Recovery](#disaster-recovery)

---

## 1. Infrastructure Requirements

### For 1 Million+ Users (All India Scale)

| Component | Specification | Quantity | Monthly Cost (USD) |
|-----------|--------------|----------|-------------------|
| **Application Servers** | ECS Tasks (2vCPU, 4GB) | 50 | $1,500 |
| **Database** | RDS PostgreSQL (db.r6g.2xlarge) Multi-AZ | 1 + 5 replicas | $800 |
| **Cache** | ElastiCache Redis (cache.r6g.xlarge) | 3-node cluster | $400 |
| **CDN** | CloudFront | 1TB/month | $100 |
| **Load Balancer** | Application Load Balancer | 2 (Multi-region) | $50 |
| **Storage** | S3 | 500GB | $12 |
| **Monitoring** | CloudWatch + Sentry | - | $150 |
| **AI/LLM** | OpenAI API | 10M tokens/day | $3,000 |
| **Total** | | | **~$6,000/month** |

### Cost Optimization Tips

- Use Reserved Instances: Save 30-40%
- Self-host LLM: Reduce AI costs by 80%
- Aggressive caching: Reduce API calls
- Auto-scaling: Scale down during off-peak hours
- Use Spot Instances: Save 70% on compute

---

## 2. AWS Deployment (Recommended)

### Prerequisites

```bash
# Install AWS CLI
brew install awscli  # macOS
# or
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### Step 1: Setup VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=indian-gov-qa-vpc}]'

# Create Subnets (Mumbai region - ap-south-1)
# Public Subnet 1 (AZ: ap-south-1a)
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone ap-south-1a

# Public Subnet 2 (AZ: ap-south-1b)
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone ap-south-1b

# Private Subnet 1
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.11.0/24 --availability-zone ap-south-1a

# Private Subnet 2
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.12.0/24 --availability-zone ap-south-1b

# Create Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx
```

### Step 2: Setup RDS PostgreSQL

```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name indian-gov-qa-db-subnet \
  --db-subnet-group-description "Subnet group for Indian Gov QA DB" \
  --subnet-ids subnet-xxx subnet-yyy

# Create PostgreSQL Database (Multi-AZ)
aws rds create-db-instance \
  --db-instance-identifier indian-gov-qa-db \
  --db-instance-class db.r6g.2xlarge \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --db-subnet-group-name indian-gov-qa-db-subnet \
  --backup-retention-period 7 \
  --publicly-accessible false

# Create Read Replicas
aws rds create-db-instance-read-replica \
  --db-instance-identifier indian-gov-qa-db-replica-1 \
  --source-db-instance-identifier indian-gov-qa-db \
  --availability-zone ap-south-1b
```

### Step 3: Setup ElastiCache Redis

```bash
# Create Redis Cluster
aws elasticache create-replication-group \
  --replication-group-id indian-gov-qa-redis \
  --replication-group-description "Redis cluster for Indian Gov QA" \
  --engine redis \
  --cache-node-type cache.r6g.xlarge \
  --num-cache-clusters 3 \
  --automatic-failover-enabled \
  --multi-az-enabled \
  --cache-subnet-group-name indian-gov-qa-redis-subnet
```

### Step 4: Create ECR Repositories

```bash
# Create ECR repositories
aws ecr create-repository --repository-name indian-gov-qa-backend
aws ecr create-repository --repository-name indian-gov-qa-frontend

# Get login credentials
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ECR_URL>
```

### Step 5: Build and Push Docker Images

```bash
# Build images
cd backend
docker build -t indian-gov-qa-backend:latest .

cd ../frontend
docker build -t indian-gov-qa-frontend:latest .

# Tag images
docker tag indian-gov-qa-backend:latest <ECR_URL>/indian-gov-qa-backend:latest
docker tag indian-gov-qa-frontend:latest <ECR_URL>/indian-gov-qa-frontend:latest

# Push to ECR
docker push <ECR_URL>/indian-gov-qa-backend:latest
docker push <ECR_URL>/indian-gov-qa-frontend:latest
```

### Step 6: Create ECS Cluster

```bash
# Create ECS Cluster
aws ecs create-cluster --cluster-name indian-gov-qa-cluster

# Create Task Definitions
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

**backend-task-definition.json**:

```json
{
  "family": "indian-gov-qa-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<ECR_URL>/indian-gov-qa-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "5000"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "OPENAI_API_KEY", "valueFrom": "arn:aws:secretsmanager:..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/indian-gov-qa-backend",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 7: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name indian-gov-qa-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing

# Create Target Groups
aws elbv2 create-target-group \
  --name indian-gov-qa-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /health

aws elbv2 create-target-group \
  --name indian-gov-qa-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /

# Create Listeners
aws elbv2 create-listener \
  --load-balancer-arn <ALB_ARN> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<ACM_CERT_ARN> \
  --default-actions Type=forward,TargetGroupArn=<TG_ARN>
```

### Step 8: Create ECS Services

```bash
# Backend Service
aws ecs create-service \
  --cluster indian-gov-qa-cluster \
  --service-name backend-service \
  --task-definition indian-gov-qa-backend:1 \
  --desired-count 10 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<TG_ARN>,containerName=backend,containerPort=5000"

# Frontend Service
aws ecs create-service \
  --cluster indian-gov-qa-cluster \
  --service-name frontend-service \
  --task-definition indian-gov-qa-frontend:1 \
  --desired-count 5 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<TG_ARN>,containerName=frontend,containerPort=3000"
```

### Step 9: Setup Auto-Scaling

```bash
# Register scalable targets
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/indian-gov-qa-cluster/backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 10 \
  --max-capacity 100

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/indian-gov-qa-cluster/backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

**scaling-policy.json**:

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 300
}
```

### Step 10: Setup CloudFront CDN

```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

---

## 3. Alternative Platforms

### Vercel + Railway (Quick Deploy)

```bash
# Frontend on Vercel
cd frontend
vercel --prod

# Backend on Railway
railway login
railway init
railway up
```

### Google Cloud Platform

- Use GKE (Google Kubernetes Engine)
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud CDN

### Azure

- Azure Container Apps
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Front Door

---

## 4. Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Strong JWT secrets generated
- [ ] Database backups enabled
- [ ] SSL certificates configured
- [ ] CORS properly configured
- [ ] Rate limiting tested
- [ ] Error monitoring setup (Sentry)
- [ ] Logging configured (CloudWatch)
- [ ] Health checks working
- [ ] Load testing completed
- [ ] Security audit done
- [ ] DNS records configured
- [ ] CDN configured
- [ ] Auto-scaling tested
- [ ] Disaster recovery plan ready

---

## 5. Monitoring & Maintenance

### CloudWatch Alarms

```bash
# CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name backend-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name backend-high-errors \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### Log Monitoring

```bash
# View logs
aws logs tail /ecs/indian-gov-qa-backend --follow
```

---

## 6. Scaling Strategy

### Horizontal Scaling

- Auto-scale ECS tasks based on CPU/Memory
- Add read replicas for database
- Use Redis cluster for distributed caching

### Vertical Scaling

- Upgrade RDS instance type
- Upgrade ElastiCache node type
- Increase ECS task resources

### Geographic Scaling

- Deploy in Mumbai (ap-south-1)
- Add Delhi region for failover
- Use Route 53 for geo-routing

---

## 7. Disaster Recovery

### Backup Strategy

```bash
# Automated RDS backups (daily)
aws rds modify-db-instance \
  --db-instance-identifier indian-gov-qa-db \
  --backup-retention-period 30

# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier indian-gov-qa-db \
  --db-snapshot-identifier indian-gov-qa-snapshot-$(date +%Y%m%d)
```

### Recovery Procedures

1. **Database failure**: Promote read replica
2. **Application failure**: Rollback to previous task definition
3. **Region failure**: Failover to secondary region
4. **Complete disaster**: Restore from backups

---

## Success Metrics

- **Uptime**: 99.9% (8.76 hours downtime/year max)
- **Response Time**: <500ms p95
- **Error Rate**: <0.1%
- **Throughput**: 10,000+ req/sec
- **Cost**: <$0.006 per user per month

---

**Deployment complete! 🎉**

Monitor your application at:
- CloudWatch: https://console.aws.amazon.com/cloudwatch
- Application: https://yourdomain.com
