const API_BASE_URL =
  window.API_BASE_URL || "https://cohort3-code.onrender.com";

const form = document.getElementById("token-form");
const textInput = document.getElementById("text-input");
const tokenizerSelect = document.getElementById("tokenizer-select");
const resultsCard = document.getElementById("results-card");
const tokensList = document.getElementById("tokens-list");
const tokenCount = document.getElementById("token-count");
const selectedTokenizer = document.getElementById("selected-tokenizer");
const errorCard = document.getElementById("error-card");
const errorMessage = document.getElementById("error-message");

function describeTokenizer(value) {
  switch (value) {
    case "bert-base-uncased":
      return "Hugging Face • bert-base-uncased";
    case "cl100k_base":
      return "OpenAI • cl100k_base";
    default:
      return "Simple Regex Tokenizer";
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorCard.hidden = false;
}

function hideError() {
  errorCard.hidden = true;
  errorMessage.textContent = "";
}

function renderTokens(tokens, tokenIds) {
  tokensList.replaceChildren(
    ...tokens.map((token, index) => {
      const item = document.createElement("li");
      const badge = document.createElement("span");
      badge.className = "token-index";
      badge.textContent = `#${index + 1}`;

      item.appendChild(badge);

      if (Array.isArray(tokenIds)) {
        const idBadge = document.createElement("span");
        idBadge.className = "token-id";
        idBadge.textContent = tokenIds[index];
        item.appendChild(idBadge);
      }

      const code = document.createElement("code");
      code.textContent = JSON.stringify(token);

      item.appendChild(code);
      return item;
    })
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();
  resultsCard.hidden = true;

  const text = textInput.value.trim();
  const tokenizer = tokenizerSelect.value;
  if (!text) {
    showError("Please enter some text to tokenize.");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}/tokenize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tokenizer }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Tokenizer service returned an error.");
    }

    const data = await response.json();
    renderTokens(data.tokens, data.token_ids);
    selectedTokenizer.textContent = describeTokenizer(data.tokenizer);
    tokenCount.textContent = `${data.count} token${data.count === 1 ? "" : "s"}`;
    resultsCard.hidden = false;
  } catch (error) {
    if (error.name === "AbortError") {
      showError("Request timed out. Check that the backend server is running.");
    } else {
      showError(error.message);
    }
  } finally {
    clearTimeout(timeout);
  }
});

selectedTokenizer.textContent = describeTokenizer(tokenizerSelect.value);

tokenizerSelect.addEventListener("change", () => {
  selectedTokenizer.textContent = describeTokenizer(tokenizerSelect.value);
});


