import os
import torch
import transformers as tr
from typing import Optional, Union, List
from dotenv import load_dotenv

# Mistral imports
try:
    from mistral_inference.transformer import Transformer
    from mistral_inference.generate import generate as mistral_generate
    from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
    from mistral_common.protocol.instruct.messages import UserMessage
    from mistral_common.protocol.instruct.request import ChatCompletionRequest
    MISTRAL_AVAILABLE = True
except ImportError:
    MISTRAL_AVAILABLE = False

# Load project .env
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=_env_path)

if os.getenv("HF_TOKEN"):
    os.environ["HUGGING_FACE_HUB_TOKEN"] = os.environ["HF_TOKEN"]

class Red:
    """
    A premium wrapper for LLMs. Supports Hugging Face (via Transformers) 
    and Mistral (via mistral_inference).
    """
    def __init__(self, model_name: str = "mistralai/Mistral-7B-Instruct-v0.3", device: Optional[str] = None):
        self.model_name = model_name
        # We only use the specialized Mistral inference branch if it's a local folder
        # AND the library is installed. Otherwise, we use Transformers.
        self.is_mistral_native = (
            MISTRAL_AVAILABLE and 
            (os.path.isdir(model_name) or os.path.isdir(os.getenv("MISTRAL_MODELS_PATH") or ""))
        )
        
        if device is None:
            if torch.cuda.is_available():
                self.device = "cuda"
            elif torch.backends.mps.is_available():
                self.device = "mps"
            else:
                self.device = "cpu"
        else:
            self.device = device

        print(f"Initializing Red with model: {model_name} on {self.device}...")

        if self.is_mistral_native:
            # Check if model_name is a folder (for mistral_inference local weights)
            model_path = model_name if os.path.isdir(model_name) else os.getenv("MISTRAL_MODELS_PATH")
            
            if model_path and os.path.isdir(model_path):
                print(f"Loading native Mistral from folder: {model_path}")
                self.tokenizer = MistralTokenizer.from_file(os.path.join(model_path, "tokenizer.model.v3"))
                self.model = Transformer.from_folder(model_path)
            else:
                self.is_mistral_native = False 
                print("Mistral local folder not found. Falling back to Transformers...")

        if not self.is_mistral_native:
            # Standard Transformers loading with 4-bit quantization support
            self.tokenizer = tr.AutoTokenizer.from_pretrained(model_name)
            
            load_kwargs = {
                "pretrained_model_name_or_path": model_name,
                "trust_remote_code": True
            }

            if self.device == "cuda":
                # Use 4-bit quantization if possible to save memory
                try:
                    from transformers import BitsAndBytesConfig
                    quant_config = BitsAndBytesConfig(
                        load_in_4bit=True,
                        bnb_4bit_compute_dtype=torch.float16,
                        bnb_4bit_quant_type="nf4",
                        bnb_4bit_use_double_quant=True,
                    )
                    load_kwargs["quantization_config"] = quant_config
                    print("Enabling 4-bit quantization...")
                except ImportError:
                    load_kwargs["dtype"] = torch.float16
                    load_kwargs["device_map"] = "auto"

                self.model = tr.AutoModelForCausalLM.from_pretrained(**load_kwargs)
            else:
                self.model = tr.AutoModelForCausalLM.from_pretrained(
                    model_name, dtype=torch.float32
                ).to(self.device)

            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.pipeline = tr.pipeline(
                'text-generation',
                model=self.model,
                tokenizer=self.tokenizer,
                # device is handled by device_map in load_kwargs for CUDA
                device=None if self.device == "cuda" else -1
            )

    def generate(
        self, 
        prompt: str, 
        max_new_tokens: int = 64, 
        temperature: float = 0.0, 
        top_p: float = 0.9,
        do_sample: bool = True
    ) -> str:
        if self.is_mistral_native:
            completion_request = ChatCompletionRequest(messages=[UserMessage(content=prompt)])
            tokens = self.tokenizer.encode_chat_completion(completion_request).tokens
            
            # mistral_inference expects a list of token lists
            out_tokens, _ = mistral_generate(
                [tokens], 
                self.model, 
                max_tokens=max_new_tokens, 
                temperature=temperature, 
                eos_id=self.tokenizer.instruct_tokenizer.tokenizer.eos_id
            )
            return self.tokenizer.instruct_tokenizer.tokenizer.decode(out_tokens[0])
        else:
            results = self.pipeline(
                prompt,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=do_sample if temperature > 0 else False,
                pad_token_id=self.tokenizer.eos_token_id,
                max_length=None
            )
            return results[0]['generated_text']

    def __call__(self, prompt: str, **kwargs) -> str:
        return self.generate(prompt, **kwargs)

    def __repr__(self) -> str:
        return f"<Red Model='{self.model_name}' Device='{self.device}' Mistral={self.is_mistral}>"

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.device == "cuda":
            torch.cuda.empty_cache()

if __name__ == "__main__":
    # Test with default or mistral if path set
    m_path = os.getenv("MISTRAL_MODELS_PATH")
    model_to_test = m_path if m_path and os.path.isdir(m_path) else "distilgpt2"
    
    try:
        with Red(model_to_test) as red:
            print("\n--- Test Generation ---")
            print(red("Explain Machine Learning to me in a nutshell.", max_new_tokens=64))
            print("-----------------------\n")
    except Exception as e:
        print(f"Error during test: {e}")