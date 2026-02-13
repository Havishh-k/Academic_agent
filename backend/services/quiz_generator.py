"""Quiz Generator — Adaptive quiz generation from curriculum (no embeddings needed)."""
from typing import Dict, List, Optional
import json
import random
import httpx

import google.generativeai as genai

from config.settings import GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
from config.rag_config import GEMINI_CONFIG
from prompts.quiz_prompts import (
    TOPIC_EXTRACTION_PROMPT,
    QUIZ_GENERATION_PROMPT,
    FEEDBACK_PROMPT,
)


class QuizGenerator:
    """Generates adaptive quizzes based on curriculum context and student mastery."""

    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_CONFIG["model"])

    def _headers(self):
        return {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
        }

    def _parse_json(self, text: str) -> any:
        """Attempt to parse JSON from LLM output, stripping markdown fences."""
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]  # Remove first line
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
        text = text.strip()
        return json.loads(text)

    def calculate_difficulty(self, mastery_score: float) -> str:
        """Map mastery score to difficulty level."""
        if mastery_score < 0.3:
            diff = "beginner"
        elif mastery_score < 0.7:
            diff = "intermediate"
        else:
            diff = "advanced"

        # Zone of Proximal Development: occasionally challenge
        if mastery_score > 0.5 and random.random() < 0.3:
            level_up = {"beginner": "intermediate", "intermediate": "advanced", "advanced": "advanced"}
            diff = level_up[diff]

        return diff

    def _fetch_context(self, topic: str, subject_id: str, limit: int = 10) -> str:
        """Fetch relevant knowledge_base chunks directly from Supabase.
        No embeddings needed — uses simple keyword filtering with fallback."""
        headers = self._headers()
        rows = []

        try:
            # Strategy 1: Try ilike search for the full topic phrase
            url = (
                f"{SUPABASE_URL}/rest/v1/knowledge_base"
                f"?course_id=eq.{subject_id}"
                f"&content=ilike.*{topic.strip().replace(' ', '*')}*"
                f"&select=content,title,source_document,chunk_index"
                f"&order=chunk_index.asc"
                f"&limit={limit}"
            )
            resp = httpx.get(url, headers=headers, timeout=10.0)
            if resp.status_code == 200:
                rows = resp.json()
        except Exception as e:
            print(f"[QuizGenerator] ilike search error: {e}")

        # Strategy 2: If no results, try each keyword individually
        if not rows:
            try:
                keywords = topic.strip().split()
                for kw in keywords[:3]:
                    if len(kw) < 3:
                        continue
                    url = (
                        f"{SUPABASE_URL}/rest/v1/knowledge_base"
                        f"?course_id=eq.{subject_id}"
                        f"&content=ilike.*{kw}*"
                        f"&select=content,title,source_document,chunk_index"
                        f"&order=chunk_index.asc"
                        f"&limit={limit}"
                    )
                    resp = httpx.get(url, headers=headers, timeout=10.0)
                    if resp.status_code == 200:
                        found = resp.json()
                        if found:
                            rows = found
                            break
            except Exception as e:
                print(f"[QuizGenerator] keyword search error: {e}")

        # Strategy 3: Fallback — just grab chunks from this subject
        if not rows:
            try:
                url = (
                    f"{SUPABASE_URL}/rest/v1/knowledge_base"
                    f"?course_id=eq.{subject_id}"
                    f"&select=content,title,source_document,chunk_index"
                    f"&order=chunk_index.asc"
                    f"&limit={limit}"
                )
                resp = httpx.get(url, headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    rows = resp.json()
            except Exception as e:
                print(f"[QuizGenerator] fallback fetch error: {e}")

        if not rows:
            return ""

        parts = []
        for i, row in enumerate(rows, 1):
            src = row.get("source_document", "Unknown")
            text = row.get("content", "")
            parts.append(f"[Source {i}: {src}]\n{text}")

        return "\n\n---\n\n".join(parts)

    def extract_topics(self, conversation_history: str) -> List[Dict]:
        """Extract quiz-worthy topics from a conversation."""
        prompt = TOPIC_EXTRACTION_PROMPT.format(
            conversation_history=conversation_history
        )
        try:
            response = self.model.generate_content(prompt)
            topics = self._parse_json(response.text)
            return [t for t in topics if t.get("importance", 0) > 0.5]
        except Exception:
            return []

    def generate_quiz(
        self,
        topic: str,
        subject_id: str,
        mastery_score: float = 0.5,
        question_count: int = 5,
    ) -> Dict:
        """Generate a quiz on a topic using curriculum context."""
        difficulty = self.calculate_difficulty(mastery_score)

        # Retrieve curriculum context directly (no embeddings)
        context = self._fetch_context(topic, subject_id)

        if not context:
            return {
                "error": "No curriculum materials found for this topic.",
                "questions": [],
            }

        prompt = QUIZ_GENERATION_PROMPT.format(
            question_count=question_count,
            topic=topic,
            difficulty=difficulty,
            context=context,
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=3000,
                ),
            )
            quiz_data = self._parse_json(response.text)
            quiz_data["difficulty"] = difficulty
            quiz_data["topic"] = topic
            return quiz_data
        except Exception as e:
            return {"error": f"Failed to generate quiz: {e}", "questions": []}

    def evaluate_answer(
        self,
        question: str,
        correct_answer: str,
        student_answer: str,
    ) -> Dict:
        """Evaluate a student's answer and provide feedback."""
        prompt = FEEDBACK_PROMPT.format(
            question=question,
            correct_answer=correct_answer,
            student_answer=student_answer,
        )

        try:
            response = self.model.generate_content(prompt)
            return self._parse_json(response.text)
        except Exception:
            is_correct = student_answer.strip().lower() == correct_answer.strip().lower()
            return {
                "correct": is_correct,
                "feedback": "Correct!" if is_correct else f"The correct answer is: {correct_answer}",
                "misconception": None,
                "review_topics": [],
            }
