from enum import Enum
import re
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer
import tiktoken


app = FastAPI(title="Tokenizer Demo API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKEN_PATTERN = re.compile(r"\w+|'s|n't|[^\w\s]", re.UNICODE)
HF_TOKENIZER = AutoTokenizer.from_pretrained("bert-base-uncased")
OPENAI_TOKENIZER = tiktoken.get_encoding("cl100k_base")


class TokenizerName(str, Enum):
    simple = "simple"
    bert_base_uncased = "bert-base-uncased"
    cl100k_base = "cl100k_base"


class TextPayload(BaseModel):
    text: str
    tokenizer: TokenizerName = TokenizerName.simple


def tokenize_simple(text: str) -> Dict[str, Any]:
    tokens = TOKEN_PATTERN.findall(text) if text else []
    return {"tokens": tokens}


def tokenize_huggingface(text: str) -> Dict[str, Any]:
    tokens = HF_TOKENIZER.tokenize(text)
    token_ids = HF_TOKENIZER.convert_tokens_to_ids(tokens)
    return {"tokens": tokens, "token_ids": token_ids}


def tokenize_openai(text: str) -> Dict[str, Any]:
    token_ids = OPENAI_TOKENIZER.encode(text)
    tokens = [OPENAI_TOKENIZER.decode([token_id]) for token_id in token_ids]
    return {"tokens": tokens, "token_ids": token_ids}


TOKENIZER_FUNCTIONS = {
    TokenizerName.simple: tokenize_simple,
    TokenizerName.bert_base_uncased: tokenize_huggingface,
    TokenizerName.cl100k_base: tokenize_openai,
}


def tokenize_text_value(text: str, tokenizer_name: TokenizerName) -> Dict[str, Any]:
    tokenizer_fn = TOKENIZER_FUNCTIONS[tokenizer_name]
    return tokenizer_fn(text)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Tokenizer service is running"}


@app.head("/health", include_in_schema=False)
def health_check_head() -> None:
    return None


@app.get("/tokenizers")
def list_tokenizers() -> Dict[str, List[str]]:
    return {"tokenizers": [tokenizer.value for tokenizer in TokenizerName]}


@app.post("/tokenize")
def tokenize(payload: TextPayload) -> Dict[str, Any]:
    result = tokenize_text_value(payload.text, payload.tokenizer)
    tokens = result["tokens"]
    response: Dict[str, Any] = {
        "tokenizer": payload.tokenizer,
        "tokens": tokens,
        "count": len(tokens),
    }
    token_ids: Optional[List[int]] = result.get("token_ids")
    if token_ids is not None:
        response["token_ids"] = token_ids
    return response


