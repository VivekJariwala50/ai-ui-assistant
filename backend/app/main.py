from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from .routers.process import router as process_router

app = FastAPI(
    title="AI UI Assistant",
    description="Free local UI element detection & click suggestions - OpenCV + heuristic engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://ai-ui-assistant.vercel.app" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI UI Assistant API is running. Use /api/process to analyze screenshots."}