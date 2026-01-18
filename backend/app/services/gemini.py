"""
Google Generative AI (Gemini) service for generating predictions and personality analysis.
"""
import google.generativeai as genai
import os
import json
import logging
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set. AI features will return default responses.")
else:
    genai.configure(api_key=GEMINI_API_KEY)


async def predict_consequences(decision_text: str) -> Dict[str, str]:
    """
    Generate AI predictions for a decision's consequences.
    
    Args:
        decision_text: The decision text to analyze
        
    Returns:
        Dictionary with 'good', 'bad', and 'weird' consequence predictions
    """
    if not GEMINI_API_KEY:
        return {
            "good": "AI predictions unavailable (API key not configured)",
            "bad": "AI predictions unavailable (API key not configured)",
            "weird": "AI predictions unavailable (API key not configured)"
        }
    
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        prompt = f"""
        A user is considering this decision: "{decision_text}".
        Predict 3 consequences: 1 good, 1 bad, and 1 weird/bizarre.
        Return ONLY a raw JSON object (no markdown, no code blocks) with keys: "good", "bad", "weird".
        Each value should be a single sentence.
        """
        
        response = await model.generate_content_async(prompt)
        
        # Clean response text
        text = response.text.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        
        # Parse JSON
        predictions = json.loads(text)
        
        # Validate response has required keys
        required_keys = ['good', 'bad', 'weird']
        if all(key in predictions for key in required_keys):
            return predictions
        else:
            raise ValueError("AI response missing required keys")
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error in predict_consequences: {e}")
        return {
            "good": "AI couldn't generate a valid prediction",
            "bad": "AI couldn't generate a valid prediction", 
            "weird": "AI couldn't generate a valid prediction"
        }
    except Exception as e:
        logger.error(f"Error in predict_consequences: {e}")
        return {
            "good": "Unexpected outcome awaits",
            "bad": "There may be unforeseen challenges",
            "weird": "Something unusual might happen"
        }


async def predict_personality(decision_texts: List[str]) -> str:
    """
    Analyze a user's personality based on their decision-making patterns.

    Args:
        decision_texts: List of decision texts from the user

    Returns:
        Personality analysis as a string
    """
    if not GEMINI_API_KEY:
        return "AI personality analysis unavailable (API key not configured)."

    if not decision_texts:
        return "Not enough decisions to analyze personality."

    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')

        decisions_str = "\n".join(f"- {text}" for text in decision_texts)

        prompt = f"""
        Analyze this user's decision-making patterns based on their posted decisions:

        {decisions_str}

        Provide a personality and character analysis. Consider:
        - Risk-taking vs caution
        - Impulsiveness vs deliberation
        - Self-interest vs altruism
        - Creativity vs practicality
        - Decision-making style
        - Any other notable traits

        Write a concise, engaging, and positive personality report (2-3 paragraphs).
        Be constructive and insightful.
        """

        response = await model.generate_content_async(prompt)

        personality_text = response.text.strip()

        if personality_text:
            return personality_text
        else:
            return "Unable to generate personality analysis from the provided decisions."

    except Exception as e:
        logger.error(f"Error in predict_personality: {e}")
        return "Unable to generate personality analysis at this time. Please try again later."


async def generate_consensus_recommendation(
    decision_text: str,
    similar_decisions: List[Dict[str, any]]
) -> str:
    """
    Generate AI recommendation based on community consensus from similar decisions.

    Args:
        decision_text: The decision the user is considering
        similar_decisions: List of similar decisions with their vote data

    Returns:
        Recommendation string based on consensus analysis
    """
    if not GEMINI_API_KEY:
        return "AI consensus analysis unavailable (API key not configured)."

    if not similar_decisions:
        return "Not enough similar decisions to analyze consensus."

    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')

        # Format similar decisions with vote data
        similar_str = ""
        for i, decision in enumerate(similar_decisions[:10], 1):  # Limit to 10 for context
            consensus = "community chose to do it" if decision['do_it_count'] > decision['dont_do_it_count'] else "community chose not to do it"
            confidence = abs(decision['do_it_count'] - decision['dont_do_it_count']) / (decision['do_it_count'] + decision['dont_do_it_count']) * 100 if (decision['do_it_count'] + decision['dont_do_it_count']) > 0 else 0
            similar_str += f"{i}. Decision: '{decision['content']}'\n   Votes: {decision['do_it_count']} do it, {decision['dont_do_it_count']} don't do it\n   Consensus: {consensus} ({confidence:.1f}% confidence)\n\n"

        prompt = f"""
        A user is considering this decision: "{decision_text}"

        Here are similar decisions made by other users and how the community voted:

        {similar_str}

        Based on the community's voting patterns on these similar decisions, provide a recommendation for the user.
        Consider:
        - Overall community consensus (do it vs don't do it)
        - Strength of the consensus (how lopsided the votes are)
        - Any patterns in the types of decisions that get similar outcomes
        - Whether this decision aligns with commonly accepted or rejected decision types

        Provide a helpful, balanced recommendation (2-3 sentences) that considers both the consensus and individual circumstances.
        Be encouraging and constructive.
        """

        response = await model.generate_content_async(prompt)

        recommendation = response.text.strip()

        if recommendation:
            return recommendation
        else:
            return "Unable to generate consensus-based recommendation."

    except Exception as e:
        logger.error(f"Error in generate_consensus_recommendation: {e}")
        return "Unable to generate consensus analysis at this time. Please try again later."


async def analyze_life_areas(decision_texts: List[str]) -> Dict[str, any]:
    """
    Analyze user's decisions to provide life area assessments and personalized recommendations.

    Args:
        decision_texts: List of decision texts from the user

    Returns:
        Dictionary with life area percentages and recommendations
    """
    if not GEMINI_API_KEY:
        return {
            "life_areas": {
                "career": 50,
                "relationships": 50,
                "future": 50,
                "personal_growth": 50
            },
            "recommendations": {
                "career": "AI analysis unavailable (API key not configured)",
                "relationships": "AI analysis unavailable (API key not configured)",
                "future": "AI analysis unavailable (API key not configured)",
                "personal_growth": "AI analysis unavailable (API key not configured)"
            }
        }

    if not decision_texts:
        return {
            "life_areas": {
                "career": 0,
                "relationships": 0,
                "future": 0,
                "personal_growth": 0
            },
            "recommendations": {
                "career": "Not enough decisions to analyze - start making decisions!",
                "relationships": "Not enough decisions to analyze - start making decisions!",
                "future": "Not enough decisions to analyze - start making decisions!",
                "personal_growth": "Not enough decisions to analyze - start making decisions!"
            }
        }

    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')

        decisions_str = "\n".join(f"- {text}" for text in decision_texts)

        prompt = f"""
        Analyze this user's decision-making history and provide insights about four key life areas.
        Return ONLY a valid JSON object with this exact structure:

        {{
            "life_areas": {{
                "career": <percentage 0-100>,
                "relationships": <percentage 0-100>,
                "future": <percentage 0-100>,
                "personal_growth": <percentage 0-100>
            }},
            "recommendations": {{
                "career": "<2-3 sentence recommendation>",
                "relationships": "<2-3 sentence recommendation>",
                "future": "<2-3 sentence recommendation>",
                "personal_growth": "<2-3 sentence recommendation>"
            }}
        }}

        User's decisions:
        {decisions_str}

        For the percentages: Rate how well-developed/considered each area appears based on their decisions (0-100).
        For recommendations: Provide personalized, actionable advice for each area based on their decision patterns.
        """

        response = await model.generate_content_async(prompt)

        # Clean response text
        text = response.text.strip()
        text = text.replace('```json', '').replace('```', '').strip()

        # Parse JSON
        analysis = json.loads(text)

        # Validate structure
        required_keys = ["life_areas", "recommendations"]
        if not all(key in analysis for key in required_keys):
            raise ValueError("Missing required keys in AI response")

        life_areas = analysis["life_areas"]
        recommendations = analysis["recommendations"]

        # Ensure all required life areas are present
        required_areas = ["career", "relationships", "future", "personal_growth"]
        for area in required_areas:
            if area not in life_areas:
                life_areas[area] = 50
            if area not in recommendations:
                recommendations[area] = f"No specific recommendation available for {area.replace('_', ' ')}."

        return analysis

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error in analyze_life_areas: {e}")
        return {
            "life_areas": {
                "career": 50,
                "relationships": 50,
                "future": 50,
                "personal_growth": 50
            },
            "recommendations": {
                "career": "Unable to generate personalized recommendation at this time.",
                "relationships": "Unable to generate personalized recommendation at this time.",
                "future": "Unable to generate personalized recommendation at this time.",
                "personal_growth": "Unable to generate personalized recommendation at this time."
            }
        }
    except Exception as e:
        logger.error(f"Error in analyze_life_areas: {e}")
        return {
            "life_areas": {
                "career": 50,
                "relationships": 50,
                "future": 50,
                "personal_growth": 50
            },
            "recommendations": {
                "career": "Unable to generate personalized recommendation at this time.",
                "relationships": "Unable to generate personalized recommendation at this time.",
                "future": "Unable to generate personalized recommendation at this time.",
                "personal_growth": "Unable to generate personalized recommendation at this time."
            }
        }
