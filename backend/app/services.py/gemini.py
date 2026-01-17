from google import genai
import os
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def predict_consequences(decision_text: str):
    model = genai.GenerativeModel('gemini-pro')

    # We ask for JSON specifically to make parsing easier
    prompt = f"""
    A user is considering this decision: "{decision_text}".
    Predict 3 consequences: 1 good, 1 bad, and 1 weird/bizarre.
    Return ONLY a raw JSON object (no markdown) with keys: "good", "bad", "weird".
    """

    try:
        response = await model.generate_content_async(prompt)
        text = response.text.replace('```json', '').replace('```', '')
        return json.loads(text)
    except Exception as e:
        print(f"AI Error: {e}")
        return {"good": "Unknown", "bad": "Unknown", "weird": "AI is confused"}

async def predict_personality(decision_texts: list[str]):
    model = genai.GenerativeModel('gemini-pro')

    decisions_str = "\n".join(f"- {text}" for text in decision_texts)

    prompt = f"""
    Analyze this user's decision-making patterns based on their posted decisions:

    {decisions_str}

    Provide a personality and character analysis. Consider:
    - Risk-taking vs caution
    - Impulsiveness vs deliberation
    - Self-interest vs altruism
    - Creativity vs practicality
    - Any other notable traits

    Write a concise, engaging personality report (2-3 paragraphs).
    """

    try:
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Personality AI Error: {e}")
        return "Unable to generate personality analysis at this time."
