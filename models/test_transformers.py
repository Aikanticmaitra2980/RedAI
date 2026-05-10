import transformers as tr
import torch

def test_transformers():
    print("Testing transformers...")
    try:
        model_name = "mistralai/Mistral-7B-Instruct-v0.3"
        print(f"Loading {model_name}...")
        tokenizer = tr.AutoTokenizer.from_pretrained(model_name)
        model = tr.AutoModelForCausalLM.from_pretrained(model_name)
        
        prompt = "Hello, I am"
        inputs = tokenizer(prompt, return_tensors="pt")
        
        print("Generating...")
        outputs = model.generate(**inputs, max_length=10)
        text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        print(f"Result: {text}")
        print("SUCCESS: Transformers is working correctly.")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    test_transformers()
