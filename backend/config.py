import os
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MODEL_MINI = "gpt-4o-mini"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
