# Tokenizer Demo

This simple two-part project helps students see how text can be tokenized. The backend exposes a small API that splits text into tokens, and the frontend provides an interactive UI to try it out.

## Project Structure

- `backend/`: FastAPI service that exposes a `POST /tokenize` endpoint.
- `frontend/`: Static site (HTML, CSS, JS) that calls the backend and displays the tokens.

## Getting Started

### Backend

1. Create and activate a virtual environment (optional but recommended):

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

   > **Deploying on Render (or other buildpacks):** ensure the Python runtime is 3.11. A `runtime.txt` (set to `python-3.11.9`) is provided in the `backend/` folder for Render so pre-built wheels for `tokenizers` are available and no Rust toolchain is required.

3. Run the API (reload flag is optional but handy during development):

   ```powershell
   uvicorn app:app --reload
   ```

   The server listens on `http://127.0.0.1:8000`. The first start will download the Hugging Face tokenizer weights. Use `http://127.0.0.1:8000/docs` to explore the API.

### Frontend

The frontend is a static site, so you can open it directly in your browser or serve it with any static server.

```powershell
cd frontend
start index.html
```

If you run the backend on a different host/port, update `API_BASE_URL` inside `frontend/script.js`.

## API Reference

- `GET /tokenizers` lists the available tokenizer identifiers.

- `POST /tokenize`
  - Request body: `{ "text": "any characters...", "tokenizer": "simple" | "bert-base-uncased" | "cl100k_base" }`
  - Response body:
    ```json
    {
      "tokenizer": "cl100k_base",
      "tokens": ["▁Hello", " world"],
      "token_ids": [9906, 1917],
      "count": 2
    }
    ```

The backend currently exposes three tokenizers:

- `simple`: Regex-based whitespace and punctuation splitter (original example).
- `bert-base-uncased`: Hugging Face WordPiece tokenizer.
- `cl100k_base`: OpenAI's GPT-4/GPT-3.5 tokenizer via `tiktoken`.

To experiment with additional tokenizers, extend `TOKENIZER_FUNCTIONS` in `backend/app.py` and add an option to the frontend dropdown.


