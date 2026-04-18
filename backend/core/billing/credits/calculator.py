"""Credit calculator stub"""
from typing import Dict

def calculate_prompt_cost(model: str, tokens: int) -> float:
    return tokens * 0.001

def calculate_completion_cost(model: str, tokens: int) -> float:
    return tokens * 0.002

def calculate_total_cost(prompt_tokens: int, completion_tokens: int, model: str) -> float:
    return calculate_prompt_cost(model, prompt_tokens) + calculate_completion_cost(model, completion_tokens)

def calculate_token_cost(prompt_tokens: int, completion_tokens: int, model: str) -> float:
    """Calculate token cost"""
    prompt_cost = calculate_prompt_cost(model, prompt_tokens)
    completion_cost = calculate_completion_cost(model, completion_tokens)
    return prompt_cost + completion_cost
