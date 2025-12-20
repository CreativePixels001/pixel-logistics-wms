# AWS IAM User Setup Instructions

## Create Deployment User

1. **Go to IAM Console:**
   - In the AWS search bar (top), type: `IAM`
   - Click on "IAM" to open Identity and Access Management

2. **Create New User:**
   - Click "Users" in the left sidebar
   - Click "Create user" (orange button)
   
3. **User Details:**
   - User name: `pixel-academy-deploy`
   - ✅ Check "Provide user access to the AWS Management Console - optional"
   - Select: "I want to create an IAM user"
   - Console password: Custom password (create strong one)
   - ✅ UNcheck "Users must create a new password at next sign-in"
   - Click "Next"

4. **Set Permissions:**
   - Select: "Attach policies directly"
   - Search and select these policies:
     * ✅ `AmazonEC2FullAccess`
     * ✅ `AmazonRDSFullAccess`
     * ✅ `AmazonS3FullAccess`
     * ✅ `IAMReadOnlyAccess`
   - Click "Next"

5. **Review and Create:**
   - Review settings
   - Click "Create user"

6. **Create Access Keys:**
   - Click on the user you just created (`pixel-academy-deploy`)
   - Go to "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Select use case: "Command Line Interface (CLI)"
   - Check the confirmation box
   - Click "Next"
   - Description: "Pixel Academy deployment"
   - Click "Create access key"
   
7. **SAVE THESE CREDENTIALS:**
   ```
   Access key ID: AKIA.....................
   Secret access key: ........................................
   ```
   - ⚠️ COPY BOTH NOW - Secret key won't be shown again!
   - Download .csv file for backup
   - Click "Done"

---

## ✅ After Creating IAM User, Tell Me:

1. **Access Key ID:** `AKIA...`
2. **Secret Access Key:** `........`
3. **Region you want to use:** 
   - Recommended: `ap-south-1` (Mumbai - best for India)
   - Alternative: `ap-southeast-1` (Singapore)

---

## 🎯 Next: Choose Deployment Method

### Option A: AWS Lightsail (Recommended - Simpler)
- $10/month (₹800)
- One-click setup
- Includes server + database
- Perfect for getting started

### Option B: EC2 + RDS (Free Tier for 12 months)
- More setup steps
- Better for scaling
- Free for first year
- More control

**Which do you prefer?** Tell me and I'll guide you through that option's setup.
