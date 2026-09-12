# Reliability & RAG Failure Checklist for Multi-AI Trading

Trading with multiple AI models (GPT, Claude, Gemini, DeepSeek) through a RAG (Retrieval-Augmented Generation) pipeline requires rigorous safety checks to prevent "hallucinated trades" or "data blindness." 

This checklist is designed for NOFX users and developers to ensure their AI trading assistants remain reliable under high market volatility.

## 1. Data Retrieval Integrity (The RAG Pillar)
*   [ ] **Recency Check:** Is the market data retrieved within the last 5 minutes? (Preventing trading on stale candles).
*   [ ] **Source Divergence:** Does the RAG pipeline fetch data from at least 2 independent sources (e.g., Binance + Bybit)?
*   [ ] **Noise Filtering:** Are outlier wicks or flash crashes pre-filtered before feeding data to the LLM?
*   [ ] **Token Limits:** Does the retrieved context (Market sentiment + Indicators) fit within the model's context window without truncation?

## 2. Reasoning & Logic Safety (The AI Pillar)
*   [ ] **CoT (Chain of Thought):** Is the AI forced to explain *why* it wants to open a position before executing? (Mandatory for debugging).
*   [ ] **Negative Prompting:** Does the prompt explicitly forbid trading during high-impact news (e.g., CPI/FOMC) unless specified?
*   [ ] **Temperature Control:** Is the LLM's `temperature` set to `< 0.2` for deterministic, logic-based trading decisions?
*   [ ] **Hallucination Detection:** Does the system check if the "recommended coin" actually exists in the provided market data?

## 3. Execution & Risk Safeguards (The Wallet Pillar)
*   [ ] **Max Drawdown:** Is there a hard-coded close-out if the PnL drops below a specific threshold (e.g., -5%)?
*   [ ] **Liquidity Check:** Is the order size `< 1%` of the 24h volume for the specific pair?
*   [ ] **Fee Awareness:** Does the AI factor in taker fees and slippage when calculating "Expected Profit"?
*   [ ] **API Failover:** If a primary model (e.g., Claude) fails, is there an automated switch to a fallback (e.g., GPT-4o)?

## 4. RAG Failure Recovery Mode
*   **Symptom:** AI keeps reporting "Insufficient Data."
    *   *Fix:* Check the `top_k` retrieval parameter and vector store connectivity.
*   **Symptom:** AI ignores recent price action.
    *   *Fix:* Increase the weight of "Latest Candles" in the RAG ranking algorithm.
*   **Symptom:** Conflicting advice from different models.
    *   *Fix:* Use a "Consensus Engine" (Majority vote or Weighted averaging based on model accuracy).

---
*Authored by: [chulinhcql-art](https://github.com/chulinhcql-art) - NOFX Contributor*
