# 🚀 Enterprise CI/CD Platform REST API

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

This is a production-ready, full-featured backend system built with **Node.js**, **Express**, and **MongoDB**. 

It provides the "backend brain" for a CI/CD platform, designed to help DevOps engineers and software developers manage automated workflows, store infrastructure documentation, monitor system health, and provide deep configuration analytics.

---

## ✨ Core Features

* **Pipeline Management:** Trigger, cancel, clone, and track automated CI/CD workflows.
* **Infrastructure Hub:** Centralized storage for DevOps documentation (Kubernetes, Terraform, Docker, etc.).
* **Active Monitoring & Alerts:** Track system metrics (CPU, Memory, Uptime) and trigger automated alerts.
* **YAML Tooling:** Built-in endpoints to validate, convert, and format YAML configuration files.
* **Full-Text Search:** Advanced search algorithms to quickly find workflows and guides.
* **Robust Security:** JWT authentication, Helmet headers, CORS protection, and DDoS mitigation via Rate Limiting.

---

## 🛠️ Technology Stack

1. **Runtime & Framework:** Node.js + Express
2. **Database:** MongoDB Atlas (Mongoose ORM)
3. **Format Support:** `js-yaml` 
4. **Security & Utilities:** `helmet`, `cors`, `express-rate-limit`, `express-validator`, `bcryptjs`, `jsonwebtoken`

---

## 📂 File Structure

For a minimal, clean deployment, the project relies on the following core directories:

```text
/config       - Database connections and environment setups
/controllers  - Core business logic and endpoint handlers
/middleware   - Security guards (JWT), error handlers, validations
/models       - Mongoose NoSQL schemas
/routes       - API routing definitions
/services     - Extracted business logic and helper functions
/utils        - Reusable utility functions
server.js     - Main Express entry point
```

---

## 🚀 Quick Start Guide (Local Development)

### 1. Installation
Install the necessary node packages:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_key
RATE_LIMIT_MAX=1000
```

### 3. Running the Server
```bash
# For development with nodemon hot-reload
npm run dev

# For production
npm start
```
The server will boot up at `http://localhost:5000`.

---

## ☁️ Deployment Guide (Render)

This API is fully optimized for deployment on cloud providers like [Render](https://render.com).

1. **Push to GitHub:** Ensure your code (without `.env` or `node_modules`) is pushed to a GitHub repository.
2. **Connect to Render:** Log into Render and click **New Web Service**.
3. **Select Repository:** Choose your GitHub repository.
4. **Configure Settings:**
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. **Environment Variables:** In the Render dashboard, copy all values from your local `.env` file into the Environment Variables section.
6. **Deploy:** Click **Create Web Service**. Render will automatically build and host your API.

---

## 🌐 API Documentation

Detailed API documentation and sample requests can be tested using the generated Postman Collection. 
Once the server is running (locally or deployed), use Postman to import the collection and interact with the endpoints:

* **Workflows:** `/api/v1/workflows`
* **Infrastructure Guides:** `/api/v1/infra`
* **Authentication:** `/api/v1/auth`
* **Monitoring & Alerts:** `/api/v1/monitoring`
* **YAML Utilities:** `/api/v1/yaml`

* ### 📬 Postman API Collection

Explore and test all API endpoints using the official Postman documentation:

🔗 [View Postman Documentation](https://documenter.getpostman.com/view/50839329/2sBXwntsU4)

The collection includes:
- Authentication APIs
- Workflow Management APIs
- Infrastructure APIs
- Monitoring & Alert APIs
- YAML Utility APIs
- Sample requests & responses

---
*Built with ❤️ for DevOps & Automation.*
