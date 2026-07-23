FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (REQUIRED FOR OPENCV TO RUN IN DOCKER)
RUN apt-get update && \
    apt-get install -y ca-certificates curl libgl1 libglib2.0-0 && \
    update-ca-certificates

# Copy requirements file
COPY requirements.txt .

# Upgrade pip
RUN python -m pip install --upgrade pip --trusted-host pypi.org --trusted-host files.pythonhosted.org

# Install dependencies (trusted hosts fix SSL issue)
RUN pip install --no-cache-dir \
    --trusted-host pypi.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt

# Copy backend code
COPY . .

# Create directories
RUN mkdir -p temp/input temp/output

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]