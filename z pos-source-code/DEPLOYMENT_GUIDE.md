# AI-POS Full-Stack Production Deployment Guide

This guide provides step-by-step instructions for deploying the entire AI-POS ecosystem: the **Spring Boot Backend**, the **React (Vite) Frontend**, and the **YOLOv8 AI Vision Service**.

## 🏗️ Architecture Overview

The system is containerized using Docker, allowing all three components (plus MySQL) to run orchestrations "side by side" in any environment.

- **Frontend**: Served via Nginx on port 80.
- **Backend**: API server running on port 5000.
- **Vision Service**: Python WebSocket server running on port 8080.
- **Database**: MySQL 8.0 on port 3306.

---

## 🚀 Deployment Steps

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

### 2. Configure Environment Variables
Before building, update the following files with your production secrets:

- **Frontend**: `pos-frontend-vite/.env.production`
- **Backend**: `pos-backend/src/main/resources/application.yml`
  - Configure `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, and `CASHFREE_API_KEY` for production.

### 3. Build and Launch
Navigate to the source directory (`z pos-source-code`) and run:

```powershell
docker-compose up --build -d
```

This will:
1. Build the React frontend production bundle.
2. Compile and package the Java Spring Boot backend.
3. Set up the Python environment and download YOLO models.
4. Orchestrate them all to start together.

### 4. Direct Verification

| Service | Access URL | Status Check |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:80](http://localhost) | Should see the Login/Dashboard |
| **Backend API** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Should return a status JSON |
| **Vision AI** | `ws://localhost:8080` | Check logs: `docker logs pos-vision` |

---

## 📸 Production AI Configuration

### Camera Access in Containers
The `docker-compose.yml` handles camera pass-through for Linux hosts via `/dev/video0`. 

**Important Note for Windows/Mac Hosts**:
Docker for Windows/Mac does not support direct hardware device mapping. For local production demos on Windows:
1. Run MySQL and Backend in Docker.
2. Run the Vision Service locally via Python:
   ```powershell
   cd pos-vision
   python vision_server.py
   ```

### Performance Optimization
To use a GPU in production (recommended for high throughput), update the `pos-vision/Dockerfile` to use a CUDA-enabled base image (e.g., `nvidia/cuda:11.8.0-runtime-ubuntu22.04`) and install `pytorch` with CUDA support.

---

## 🛠️ Management Commands

- **Stop all services**: `docker-compose down`
- **View all logs**: `docker-compose logs -f`
- **View Vision logs only**: `docker-compose logs -f vision`
- **Reset Database**: `docker-compose down -v` (Careful: this deletes all data!)
