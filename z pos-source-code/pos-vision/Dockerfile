FROM python:3.9-slim

# Install system dependencies for OpenCV and YOLO
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Ensure opencv-python-headless is used if not in requirements
RUN pip install --no-cache-dir opencv-python-headless ultralytics websockets

# Copy source code and models
COPY . .

EXPOSE 8080

ENV VISION_HOST=0.0.0.0
ENV VISION_PORT=8080
ENV SHOW_VIEWFINDER=false

CMD ["python", "vision_server.py"]
