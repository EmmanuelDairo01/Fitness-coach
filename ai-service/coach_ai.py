import json
import os
import re
from collections import defaultdict

from anthropic import Anthropic

MODEL = "claude-sonnet-4-6"

COACH_PERSONA = """You are Coach, the in-app AI training partner for a fitness app called FitAI. \
You are encouraging, specific, and practical \u2014 like a knowledgeable lifting partner, not a generic \
chatbot. You have access to the user's actual logged data: their sets (weight x reps) per exercise \
over recent weeks, body weight trend, and recent nutrition.

When giving advice:
- Reference real numbers from their data whenever possible (exact weights, dates, trends).
- For strength progress, apply progressive overload logic: if someone has hit the same weight x reps \
for 2+ sessions in a row, suggest a concrete next step (e.g. "add 2.5kg next session" or "push for one \
more rep at the same weight"). If an exercise hasn't been trained in a while, gently flag it.
- Keep replies short: 2-5 sentences, or a tight 3-4 item list for plans. Use plain language, sentence case.
- You are not a doctor. If something sounds like pain or injury, suggest rest and seeing a professional \
instead of pushing through.
- Never invent numbers that are not in the provided data."""


def _format_sets(recent_sets):
    by_exercise = defaultdict(list)
    for s in recent_sets:
        by_exercise[s["exercise"]].append(s)

    lines = []
    for exercise, sets in by_exercise.items():
        sets_sorted = sorted(sets, key=lambda s: s["date"], reverse=True)[:8]
        formatted = ", ".join(f"{s['date']}: {s['weight_kg']}kg x {s['reps']}" for s in sets_sorted)
        lines.append(f"- {exercise}: {formatted}")
    return "\n".join(lines) if lines else "No workout sets logged yet."


def _format_weight(weight_trend):
    if not weight_trend:
        return "No body weight logged yet."
    points = sorted(weight_trend, key=lambda w: w["date"])
    return ", ".join(f"{w['date']}: {w['weight_kg']}kg" for w in points)


def _format_food(food_trend):
    if not food_trend:
        return "No meals logged in the last 14 days."
    points = sorted(food_trend, key=lambda f: f["date"])
    return ", ".join(f"{f['date']}: {f['calories']} kcal" for f in points)


def _build_context_block(context: dict) -> str:
    return f"""User: {context.get('user_name', 'there')}
Daily calorie goal: {context.get('daily_calorie_goal')}
Weekly workout goal: {context.get('weekly_workout_goal')} sessions

Recent sets (most recent first, per exercise):
{_format_sets(context.get('recent_sets', []))}

Body weight trend:
{_format_weight(context.get('weight_trend', []))}

Calories logged, last 14 days:
{_format_food(context.get('food_trend', []))}"""


def _demo_reply():
    return ("I'm running in demo mode right now \u2014 set ANTHROPIC_API_KEY in ai-service/.env "
            "to unlock real coaching based on your logged sets and progress.")


def chat(message: str, context: dict, history: list) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _demo_reply()

    client = Anthropic(api_key=api_key)
    system = f"{COACH_PERSONA}\n\nHere is the user's current data:\n{_build_context_block(context)}"

    messages = []
    for h in history:
        role = "assistant" if h.get("role") == "assistant" else "user"
        messages.append({"role": role, "content": h.get("content", "")})
    messages.append({"role": "user", "content": message})

    response = client.messages.create(
        model=MODEL,
        max_tokens=500,
        system=system,
        messages=messages,
    )
    return "".join(block.text for block in response.content if block.type == "text").strip()


def _demo_insights():
    return [
        "Connect an Anthropic API key in ai-service/.env to get personalized insights from your real logs.",
        "Log a few workouts and meals first \u2014 the more data Coach sees, the sharper the tips get.",
    ]


def insights(context: dict) -> list:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _demo_insights()

    client = Anthropic(api_key=api_key)
    system = (f"{COACH_PERSONA}\n\nHere is the user's current data:\n{_build_context_block(context)}\n\n"
               "Respond with ONLY a JSON array of 3 to 5 short strings (max ~18 words each), no prose, "
               "no markdown fences. Each string is one specific, actionable improvement tip grounded in "
               "the data above. If there isn't enough data yet, say so and suggest what to log next.")

    response = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=system,
        messages=[{"role": "user", "content": "Give me my improvement tips."}],
    )
    raw_text = "".join(block.text for block in response.content if block.type == "text").strip()
    raw_text = re.sub(r"^```(json)?|```$", "", raw_text, flags=re.MULTILINE).strip()
    try:
        parsed = json.loads(raw_text)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    return [raw_text] if raw_text else _demo_insights()
