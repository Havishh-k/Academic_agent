"""Quiz Generation Prompt Templates."""

TOPIC_EXTRACTION_PROMPT = """Analyze this conversation and extract testable concepts.

Conversation:
{conversation_history}

Return a JSON array of objects with these fields:
- "concept": the concept name
- "importance": a float from 0.0 to 1.0
- "coverage": "brief" or "detailed"

Return ONLY valid JSON, no markdown fences. Example:
[{{"concept": "Binary Search", "importance": 0.9, "coverage": "detailed"}}]
"""

QUIZ_GENERATION_PROMPT = """Generate {question_count} quiz questions on the topic: {topic}
Difficulty level: {difficulty}

Use ONLY the following curriculum context to create questions:
{context}

Requirements:
1. Questions MUST be answerable from the provided context ONLY
2. Mix question types: MCQ, True/False, Short Answer
3. Include plausible distractors that test common misconceptions
4. Provide detailed explanations for the correct answer

Return ONLY valid JSON with this structure (no markdown fences):
{{
  "questions": [
    {{
      "type": "mcq",
      "question": "What is...?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "B",
      "explanation": "The correct answer is B because...",
      "difficulty": "{difficulty}"
    }},
    {{
      "type": "true_false",
      "question": "Statement...",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "This is true because...",
      "difficulty": "{difficulty}"
    }},
    {{
      "type": "short_answer",
      "question": "Briefly explain...",
      "correct_answer": "Expected answer summary",
      "explanation": "A good answer should include...",
      "difficulty": "{difficulty}"
    }}
  ]
}}
"""

FEEDBACK_PROMPT = """A student answered a quiz question. Analyze their response.

Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Provide:
1. Whether the answer is correct (true/false)
2. A brief, encouraging explanation
3. If incorrect, identify the likely misconception
4. Suggest related topics for review if needed

Return ONLY valid JSON (no markdown fences):
{{
  "correct": true/false,
  "feedback": "Your explanation here...",
  "misconception": "null or description of misconception",
  "review_topics": ["topic1", "topic2"]
}}
"""
