# Enterprise CI/CD Platform REST API

This is a production-ready, full-featured backend system built with **Node.js**, **Express**, and **MongoDB**. It provides a robust workflow management engine, DevOps infrastructure documentation guides, full-text search, deep configuration analytics, and active Prometheus metric instrumentation.

---

## 🛠️ Technology Stack

1. **Runtime & Framework:** Node.js + Express (async/await middleware patterns)
2. **Database:** MongoDB (using Mongoose for schemas, validations, and text-indexing search structures)
3. **Format Support:** `js-yaml` for parsing, linting, comparing, merging, and converting YAML configs.
4. **Security & Utilities:** `helmet` (HTTP headers), `cors` (Cross-Origin requests), `express-rate-limit` (DDoS mitigation), and `express-validator` (strict request verification).

14: ---
## 📂 Folder Structure

```text
/config       - Database and third-party connection configurations
/controllers  - Core business logic and request/response handlers
/middleware   - Security guards (JWT auth), error handlers, and validation
/models       - Mongoose NoSQL schemas and indexing rules
/routes       - API routing definitions (apiRoutes.js)
/services     - Extracted business logic (e.g., authService for token creation)
server.js     - Main Express entry point and middleware pipeline
seed.js       - Seeder script for dummy workflows and infra guides
```

---

## 🚀 Quick Start Guide

### 1. Installation
Install the workspace node packages:
```bash
npm install
```

### 2. Environment Setup
Configure `.env` in the workspace directory using these variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/cidc
JWT_SECRET=supersecretkey
RATE_LIMIT_MAX=1000
```

### 3. Database Seeding
Populate your local MongoDB instance with 3 template workflows and 20 exhaustive DevOps infrastructure guides:
```bash
npm run seed
```

### 4. Running the Server
```bash
# For development with nodemon hot-reload
npm run dev

# For production
npm start
```
The server will boot up at `http://localhost:5000`.

---

## 🌐 API Route Map & Sample curl Requests

### 1. CI/CD Workflow Operations (`/api/v1/workflows`)
* **List Workflows (Paginated & Searchable):**
  ```bash
  curl "http://localhost:5000/api/v1/workflows?category=ci&search=node"
  ```
* **Trigger Workflow Execution:**
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"triggeredBy":"manual"}' http://localhost:5000/api/v1/workflows/664bf876.../run
  ```
* **Cancel Workflow Execution:**
  ```bash
  curl -X POST http://localhost:5000/api/v1/workflows/664bf876.../cancel
  ```
* **Clone Workflow:**
  ```bash
  curl -X POST http://localhost:5000/api/v1/workflows/664bf876.../clone
  ```

### 2. Kubernetes & Infrastructure Guides (`/api/v1/infra`)
* **Get Kubernetes Guides:**
  ```bash
  curl "http://localhost:5000/api/v1/infra/k8s"
  ```
* **Get Terraform Guides:**
  ```bash
  curl "http://localhost:5000/api/v1/infra/terraform"
  ```

### 3. Search & Discovery (`/api/v1/search`)
* **Full-text Search:**
  ```bash
  curl "http://localhost:5000/api/v1/search?q=kubernetes"
  ```
* **Fuzzy Match Search:**
  ```bash
  curl "http://localhost:5000/api/v1/search/fuzzy?q=dokcer"
  ```

### 4. YAML Utilities (`/api/v1/yaml`)
* **Validate YAML syntax:**
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"content":"version: 3\nservices:\n  web:\n    image: nginx"}' http://localhost:5000/api/v1/yaml/validate
  ```
* **Convert YAML to JSON:**
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"content":"name: CI\non: push"}' http://localhost:5000/api/v1/yaml/convert/json
  ```

---

## ☁️ MongoDB Atlas Migration Instructions

To migrate from your local MongoDB instance to a cloud-based MongoDB Atlas cluster, follow these steps:

### Step 1: Export Local Database
Use `mongodump` to extract the local database into a folder:
```bash
mongodump --uri="mongodb://localhost:27017/cidc" --out="./backups"
```
This generates raw BSON backups inside `./backups/cidc/`.

### Step 2: Get your MongoDB Atlas Connection String
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create or navigate to your database cluster and click **Connect**.
3. Select **Drivers** under connection methods.
4. Copy the connection string, which should look like this:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cidc?retryWrites=true&w=majority`

### Step 3: Restore Data to MongoDB Atlas
Use `mongorestore` to upload your exported local database dump directly into MongoDB Atlas:
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cidc" ./backups/cidc
```

### Step 4: Update Environment Variables
Update the `MONGO_URI` variable in your `.env` file to point to your new cluster connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cidc?retryWrites=true&w=majority
```
Restart your server (`npm run dev`), and all requests will now stream directly to and from your MongoDB Atlas Cloud instance.
