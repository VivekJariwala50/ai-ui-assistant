import os
import io
import json
from PIL import Image
from google import genai
from google.genai import types
from typing import List, Dict, Any


class GeminiService:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables.")
        self.client = genai.Client(api_key=api_key)
        # gemini-2.5-flash: fast multimodal model (latest, replaces deprecated gemini-1.5-flash)
        self.model_id = "gemini-2.5-flash"

    def _pil_to_part(self, image_bytes: bytes) -> types.Part:
        """Convert raw image bytes to a google-genai Part."""
        img = Image.open(io.BytesIO(image_bytes))
        buf = io.BytesIO()
        fmt = img.format or "PNG"
        img.save(buf, format=fmt)
        buf.seek(0)
        mime = f"image/{fmt.lower()}"
        return types.Part.from_bytes(data=buf.read(), mime_type=mime)

    def analyze_ui(self, image_bytes: bytes) -> Dict[str, Any]:
        """Performs initial analysis to detect UI elements."""
        prompt = """
        You are an expert UI/UX Assistant. Analyze the provided UI screenshot.
        Identify the main interactive elements (buttons, inputs, links, navigation, etc).
        For the top 5-8 most important elements, provide their approximate location and what they do.
        Return ONLY a JSON object with this structure:
        {
          "summary": "A brief 1-sentence description of this UI",
          "elements": [
            {
              "type": "button",
              "text": "The text on the element (if any)",
              "suggestion": "What happens when you click this",
              "reason": "Why this is an important element"
            }
          ]
        }
        """

        try:
            image_part = self._pil_to_part(image_bytes)
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[prompt, image_part],
            )
            text_response = response.text

            # Clean up markdown JSON fences if present
            if "```json" in text_response:
                text_response = text_response.split("```json")[1].split("```")[0].strip()
            elif "```" in text_response:
                text_response = text_response.split("```")[1].strip()

            data = json.loads(text_response)
            return data
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}\nRaw response: {text_response}")
            return {
                "summary": "UI analyzed but response could not be parsed.",
                "elements": [],
            }
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {
                "summary": "Could not analyze UI. Make sure GEMINI_API_KEY is valid.",
                "elements": [],
            }

    def chat(self, image_bytes: bytes, history: List[Dict[str, str]], query: str) -> str:
        """Conversational endpoint to answer questions about the UI."""
        chat_history = ""
        for msg in history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            chat_history += f"{role}: {msg.get('content')}\n"

        prompt = f"""
        You are an expert AI UI Assistant helping a user navigate the provided screenshot.

        Previous Conversation:
        {chat_history}

        User's New Question: {query}

        Answer the user's question precisely based ONLY on what you see in the screenshot.
        If they ask how to do something, describe exactly what element they should click and where it is located.
        Keep your response helpful, concise, and formatted with markdown (bolding key UI elements).
        """

        try:
            image_part = self._pil_to_part(image_bytes)
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[prompt, image_part],
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I'm having trouble connecting to my vision capabilities right now. Please check the API key."
