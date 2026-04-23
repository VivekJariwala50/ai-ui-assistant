FROM python:3.10-slim

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Create a cache directory for EasyOCR to download models into
ENV EASYOCR_MODULE_PATH=/code/.EasyOCR
RUN mkdir -p /code/.EasyOCR && chmod 777 /code/.EasyOCR

COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]