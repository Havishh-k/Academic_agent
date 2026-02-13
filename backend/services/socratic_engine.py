"""Socratic Engine — Intent classification and guided response generation."""
from enum import Enum
from typing import Dict, List, Optional
import json

import google.generativeai as genai

from config.settings import GEMINI_API_KEY
from config.rag_config import GEMINI_CONFIG
from prompts.socratic_prompts import BASE_RULES, STRATEGY_MAP


class Intent(str, Enum):
    CONCEPTUAL = "conceptual_understanding"
    PROBLEM_SOLVING = "problem_solving"
    CLARIFICATION = "clarification"
    VERIFICATION = "verification"


class SocraticStrategy(str, Enum):
    GUIDED_DISCOVERY = "guided_discovery"
    PROBLEM_DECOMPOSITION = "problem_decomposition"
    PROBING_QUESTIONS = "probing_questions"
    CONTEXTUAL_HINTS = "contextual_hints"


# Map intents to strategies
INTENT_STRATEGY_MAP = {
    Intent.CONCEPTUAL: SocraticStrategy.GUIDED_DISCOVERY,
    Intent.PROBLEM_SOLVING: SocraticStrategy.PROBLEM_DECOMPOSITION,
    Intent.VERIFICATION: SocraticStrategy.PROBING_QUESTIONS,
    Intent.CLARIFICATION: SocraticStrategy.CONTEXTUAL_HINTS,
}


class SocraticEngine:
    """Generates Socratic-method responses that guide students to discover answers."""

    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_CONFIG["model"])

    def classify_intent(self, query: str) -> Intent:
        """Classify the student's query intent."""
        prompt = f"""Classify this student query into exactly ONE of these categories:
- conceptual_understanding: Asking what something is or how it works
- problem_solving: Asking how to solve a specific problem
- clarification: Asking why something works a certain way
- verification: Asking if their solution or understanding is correct

Query: "{query}"

Return ONLY the category name, nothing else."""

        try:
            response = self.model.generate_content(prompt)
            intent_str = response.text.strip().lower().replace('"', '').replace("'", '')

            intent_map = {
                "conceptual_understanding": Intent.CONCEPTUAL,
                "problem_solving": Intent.PROBLEM_SOLVING,
                "clarification": Intent.CLARIFICATION,
                "verification": Intent.VERIFICATION,
            }
            return intent_map.get(intent_str, Intent.CONCEPTUAL)
        except Exception:
            return Intent.CONCEPTUAL

    def select_strategy(
        self, intent: Intent, mastery_score: float = 0.5
    ) -> SocraticStrategy:
        """Select the appropriate Socratic strategy based on intent and mastery."""
        if intent == Intent.CLARIFICATION and mastery_score >= 0.7:
            return SocraticStrategy.PROBING_QUESTIONS
        return INTENT_STRATEGY_MAP.get(intent, SocraticStrategy.GUIDED_DISCOVERY)

    def build_prompt(self, strategy: SocraticStrategy, context: str) -> str:
        """Assemble the full system prompt from base rules + strategy."""
        base = BASE_RULES.format(context=context)
        strategy_text = STRATEGY_MAP.get(strategy.value, "")
        return base + "\n\n" + strategy_text

    def generate_response(
        self,
        query: str,
        context: str,
        conversation_history: Optional[List[Dict]] = None,
        mastery_score: float = 0.5,
    ) -> Dict:
        """Full Socratic pipeline: classify → strategize → generate."""
        intent = self.classify_intent(query)
        strategy = self.select_strategy(intent, mastery_score)
        system_prompt = self.build_prompt(strategy, context)

        # Build the full prompt
        full_prompt = system_prompt

        if conversation_history:
            history_text = "\n".join(
                f"{'Student' if msg.get('role') == 'user' else 'Tutor'}: {msg.get('content', '')}"
                for msg in conversation_history[-5:]
            )
            full_prompt += f"\n\nConversation History:\n{history_text}"

        full_prompt += f"\n\nStudent Question: {query}\n\nYour Socratic Response:"

        try:
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=GEMINI_CONFIG["max_output_tokens"],
                ),
            )
            response_text = response.text
        except Exception as e:
            response_text = f"I encountered an issue processing your question. Please try rephrasing. (Error: {e})"

        return {
            "response": response_text,
            "intent": intent.value,
            "strategy": strategy.value,
            "mastery_considered": mastery_score,
        }

    def check_curriculum_boundary(
        self, retrieved_docs: List[Dict], subject_id: str, threshold: float = 0.7
    ) -> Dict:
        """Verify that retrieved documents are within the curriculum boundary."""
        valid_docs = [
            doc for doc in retrieved_docs
            if doc.get("course_id") == subject_id or doc.get("subject_id") == subject_id
        ]

        if not valid_docs:
            return {
                "allowed": False,
                "response": "I can only help with topics covered in your current curriculum. "
                            "This question seems to be outside our materials.",
                "flag_for_review": True,
            }

        max_score = max((doc.get("score", 0) or doc.get("similarity", 0)) for doc in valid_docs)
        if max_score < threshold:
            return {
                "allowed": False,
                "response": "I'm not finding clear information about this in our curriculum. "
                            "Could you rephrase or ask about a related topic we've covered?",
                "flag_for_review": True,
            }

        return {"allowed": True, "docs": valid_docs}
