import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

import coach_ai
import food_analysis

app = FastAPI(title="FitAI AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # locked down at the Node backend layer
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeFoodRequest(BaseModel):
    image_base64: str


class CoachChatRequest(BaseModel):
    message: str
    context: dict
    history: list = []


class CoachInsightsRequest(BaseModel):
    context: dict


@app.get("/health")
def health():
    return {"ok": True, "demo_mode": not bool(os.environ.get("ANTHROPIC_API_KEY"))}


@app.post("/analyze-food")
def analyze_food(req: AnalyzeFoodRequest):
    try:
        return food_analysis.analyze_food(req.image_base64)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Food analysis failed: {e}")


@app.post("/coach-chat")
def coach_chat(req: CoachChatRequest):
    try:
        reply = coach_ai.chat(req.message, req.context, req.history)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coach chat failed: {e}")


@app.post("/coach-insights")
def coach_insights(req: CoachInsightsRequest):
    try:
        tips = coach_ai.insights(req.context)
        return {"tips": tips}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coach insights failed: {e}")
