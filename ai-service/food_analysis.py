import base64
import json
import os
import re

from anthropic import Anthropic

MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are a nutrition analysis engine inside a fitness app. You are shown a photo \
of a meal. Identify the food and estimate its nutrition as carefully as a registered dietitian \
would from a photo alone, accounting for visible portion size.

Respond with ONLY a single JSON object, no prose, no markdown fences, in exactly this shape:
{
  "name": "short dish name, e.g. Grilled Chicken with Rice",
  "serving_description": "e.g. 1 serving (approx 350g)",
  "calories": <integer total kcal>,
  "protein_g": <number>,
  "carbs_g": <number>,
  "fats_g": <number>,
  "confidence": "low" | "medium" | "high",
  "breakdown": [
    {"item": "Chicken Breast (150g)", "calories": 280},
    {"item": "Cooked Rice (1 cup)", "calories": 230}
  ]
}
Breakdown items should roughly sum to the total calories. If the image does not clearly show food, \
still return your best-guess JSON with "confidence": "low" and a "name" describing what you see."""


def _strip_data_url(image_base64: str):
    match = re.match(r"^data:(image/\w+);base64,(.*)$", image_base64, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return "image/jpeg", image_base64


def _extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(json)?|```$", "", text, flags=re.MULTILINE).strip()
    return json.loads(text)


def _demo_fallback():
    return {
        "name": "Demo Mode \u2014 connect an API key",
        "serving_description": "Set ANTHROPIC_API_KEY in ai-service/.env to enable real photo analysis",
        "calories": 0,
        "protein_g": 0,
        "carbs_g": 0,
        "fats_g": 0,
        "confidence": "low",
        "breakdown": [],
        "demo_mode": True,
    }


def analyze_food(image_base64: str) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _demo_fallback()

    media_type, data = _strip_data_url(image_base64)
    # Validate it's actually base64 before sending upstream
    try:
        base64.b64decode(data[:100] + "==", validate=False)
    except Exception:
        raise ValueError("imageBase64 does not look like valid base64 image data")

    client = Anthropic(api_key=api_key)
    response = client.messages.create(
        model=MODEL,
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": media_type, "data": data},
                    },
                    {"type": "text", "text": "Analyze this meal."},
                ],
            }
        ],
    )

    raw_text = "".join(block.text for block in response.content if block.type == "text")
    try:
        return _extract_json(raw_text)
    except Exception:
        return {
            "name": "Could not parse this photo",
            "serving_description": "Try a clearer, well-lit photo",
            "calories": 0,
            "protein_g": 0,
            "carbs_g": 0,
            "fats_g": 0,
            "confidence": "low",
            "breakdown": [],
        }
