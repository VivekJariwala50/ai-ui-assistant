import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
print("API Key length:", len(api_key) if api_key else 0)

client = genai.Client(api_key=api_key)
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Hello"
    )
    print("Response:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
