import sys
import os
import torch
from typing import Optional
from dotenv import load_dotenv

# Import Red class from models directory
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from models.Red import Red

def generate_text(prompt: str, max_new_tokens: int = 64, model_name: Optional[str] = None):
    """
    Unified inference function using the Red wrapper.
    """
    # If no model name, try to use MISTRAL_MODELS_PATH if it exists, else gpt2
    if model_name is None:
        m_path = os.getenv("MISTRAL_MODELS_PATH")
        model_name = m_path if m_path and os.path.isdir(m_path) else "mistralai/Mistral-7B-Instruct-v0.3"

    with Red(model_name) as red:
        output = red.generate(prompt, max_new_tokens=max_new_tokens)
        return output

if __name__ == "__main__":
    user_prompt = sys.argv[1] if len(sys.argv) > 1 else "Explain Machine Learning to me in a nutshell."
    
    # Load .env explicitly for CLI usage
    _env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env")
    load_dotenv(dotenv_path=_env_path)

    try:
        output = generate_text(user_prompt)
        print(output)
    except Exception as e:
        print(f"An error occurred: {e}")
