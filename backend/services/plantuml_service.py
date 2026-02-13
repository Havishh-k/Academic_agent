"""PlantUML Service — Architecture diagram generation."""
import zlib
from typing import Optional


class PlantUMLService:
    """Generate PlantUML diagrams for system documentation."""

    SERVER_URL = "http://www.plantuml.com/plantuml/png/"

    @staticmethod
    def _encode(plantuml_text: str) -> str:
        """Encode PlantUML text for URL using deflate + custom base64."""
        compressed = zlib.compress(plantuml_text.encode("utf-8"))[2:-4]  # strip zlib header/checksum
        alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
        
        result = []
        for i in range(0, len(compressed), 3):
            if i + 2 < len(compressed):
                b1, b2, b3 = compressed[i], compressed[i+1], compressed[i+2]
            elif i + 1 < len(compressed):
                b1, b2, b3 = compressed[i], compressed[i+1], 0
            else:
                b1, b2, b3 = compressed[i], 0, 0

            result.append(alphabet[b1 >> 2])
            result.append(alphabet[((b1 & 0x3) << 4) | (b2 >> 4)])
            result.append(alphabet[((b2 & 0xF) << 2) | (b3 >> 6)])
            result.append(alphabet[b3 & 0x3F])

        return "".join(result)

    def generate_diagram_url(self, plantuml_code: str) -> str:
        """Generate a PlantUML server URL for the diagram."""
        encoded = self._encode(plantuml_code)
        return f"{self.SERVER_URL}{encoded}"

    def get_rag_flow_diagram(self) -> str:
        """RAG pipeline architecture diagram."""
        uml = """@startuml
!theme cerulean-outline
skinparam backgroundColor #FAFAFA

title RAG Pipeline Flow

actor Student
participant "Query\\nEmbedding" as QE
database "Vector DB\\n(pgvector)" as VDB
participant "Context\\nAssembly" as CA
participant "Socratic\\nEngine" as SE
participant "Gemini\\nLLM" as LLM

Student -> QE : Ask question
QE -> VDB : Similarity search
VDB --> CA : Top-K chunks
CA -> SE : Context + Query
SE -> LLM : Socratic prompt
LLM --> Student : Guided response

note over VDB
  Only approved
  curriculum documents
end note

note over SE
  Never gives
  direct answers
end note

@enduml"""
        return self.generate_diagram_url(uml)

    def get_system_architecture_diagram(self) -> str:
        """Full system architecture diagram."""
        uml = """@startuml
!theme cerulean-outline
skinparam backgroundColor #FAFAFA

title AI Academic Agent — System Architecture

package "Frontend (React + Vite)" {
  [Student Chat UI]
  [Faculty Upload Panel]
  [Admin Dashboard]
  [Quiz Interface]
}

package "Backend (FastAPI)" {
  [RAG Service]
  [Socratic Engine]
  [Quiz Generator]
  [Document Processor]
  [Embedding Service]
}

cloud "External APIs" {
  [Google Gemini]
  [PlantUML Server]
}

database "Supabase" {
  [PostgreSQL + pgvector]
  [Auth]
  [Storage]
}

[Student Chat UI] --> [RAG Service]
[Faculty Upload Panel] --> [Document Processor]
[Quiz Interface] --> [Quiz Generator]
[RAG Service] --> [Socratic Engine]
[RAG Service] --> [Embedding Service]
[Document Processor] --> [Embedding Service]
[Embedding Service] --> [Google Gemini]
[Socratic Engine] --> [Google Gemini]
[Quiz Generator] --> [Google Gemini]
[RAG Service] --> [PostgreSQL + pgvector]
[Document Processor] --> [PostgreSQL + pgvector]

@enduml"""
        return self.generate_diagram_url(uml)

    def get_er_diagram(self) -> str:
        """Database ER diagram from live schema."""
        uml = """@startuml
!theme cerulean-outline
skinparam backgroundColor #FAFAFA

title Database Schema (ER Diagram)

entity "profiles" {
  * id : UUID <<PK>>
  --
  email : text
  full_name : text
  role : text
}

entity "students" {
  * id : UUID <<PK>>
  --
  user_id : UUID <<FK>>
  student_id : text
  department : text
  year : int
}

entity "faculty" {
  * id : UUID <<PK>>
  --
  user_id : UUID <<FK>>
  faculty_id : text
  department : text
}

entity "subjects" {
  * id : UUID <<PK>>
  --
  subject_code : text
  subject_name : text
  semester : int
}

entity "knowledge_base" {
  * id : UUID <<PK>>
  --
  course_id : UUID <<FK>>
  title : text
  content : text
  embedding : vector(768)
  source_document : text
}

entity "concepts" {
  * id : UUID <<PK>>
  --
  subject_id : UUID <<FK>>
  concept_name : text
  difficulty_level : text
}

profiles ||--o{ students
profiles ||--o{ faculty
subjects ||--o{ knowledge_base
subjects ||--o{ concepts

@enduml"""
        return self.generate_diagram_url(uml)

    def get_socratic_flow_diagram(self) -> str:
        """Socratic Engine decision flow."""
        uml = """@startuml
!theme cerulean-outline
skinparam backgroundColor #FAFAFA

title Socratic Engine Decision Flow

start
:Student asks question;

:Classify Intent;
note right: LLM-based classification

switch (Intent?)
case (Conceptual)
  :Guided Discovery Strategy;
case (Problem Solving)
  :Problem Decomposition Strategy;
case (Verification)
  :Probing Questions Strategy;
case (Clarification)
  if (Mastery > 0.7?) then (yes)
    :Probing Questions;
  else (no)
    :Contextual Hints;
  endif
endswitch

:Retrieve curriculum context;
:Generate Socratic response;
:Return guided answer;

stop

@enduml"""
        return self.generate_diagram_url(uml)

    def get_diagram(self, diagram_type: str) -> Optional[str]:
        """Get diagram URL by type."""
        diagrams = {
            "rag_flow": self.get_rag_flow_diagram,
            "system_architecture": self.get_system_architecture_diagram,
            "er_diagram": self.get_er_diagram,
            "socratic_flow": self.get_socratic_flow_diagram,
        }
        fn = diagrams.get(diagram_type)
        return fn() if fn else None

    def list_available_diagrams(self) -> list:
        """List all available diagram types."""
        return [
            {"type": "rag_flow", "description": "RAG Pipeline Architecture"},
            {"type": "system_architecture", "description": "Full System Architecture"},
            {"type": "er_diagram", "description": "Database ER Diagram"},
            {"type": "socratic_flow", "description": "Socratic Engine Decision Flow"},
        ]
