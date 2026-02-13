import { CourseDocument, CurriculumUnit } from './types';

export const CURRICULUM_DATA: CurriculumUnit[] = [
  {
    id: 'unit_1',
    title: 'Unit I: Introduction & Foundations of AI',
    topics: [
      { id: 'u1_history', title: 'History and evolution of AI' },
      { id: 'u1_goals', title: 'Goals and applications of AI' },
      { id: 'u1_turing', title: 'Turing Test and Chinese Room experiment' },
      { id: 'u1_foundations', title: 'Foundations: philosophy, math, neuroscience' },
    ]
  },
  {
    id: 'unit_2',
    title: 'Unit II: Intelligent Agents',
    topics: [
      { id: 'u2_agents', title: 'Agent and environment concepts' },
      { id: 'u2_peas', title: 'PEAS framework' },
      { id: 'u2_types', title: 'Agent types: reflex, model-based, goal-based, utility-based' },
      { id: 'u2_env', title: 'Task environment properties' },
    ]
  },
  {
    id: 'unit_3',
    title: 'Unit III: Problem Solving & Uninformed Search',
    topics: [
      { id: 'u3_problem', title: 'Problem formulation and state space' },
      { id: 'u3_bfs', title: 'Breadth-First Search (BFS)' },
      { id: 'u3_dfs', title: 'Depth-First Search (DFS) & Uniform Cost Search' },
      { id: 'u3_iddfs', title: 'DLS, IDDFS & Bidirectional Search' },
    ]
  },
  {
    id: 'unit_4',
    title: 'Unit IV: Informed (Heuristic) Search',
    topics: [
      { id: 'u4_greedy', title: 'Greedy Best-First Search' },
      { id: 'u4_astar', title: 'A* Search Algorithm' },
      { id: 'u4_ida', title: 'IDA* Algorithm' },
      { id: 'u4_heuristics', title: 'Admissible and consistent heuristics' },
    ]
  },
  {
    id: 'unit_5',
    title: 'Unit V: Adversarial Search & Games',
    topics: [
      { id: 'u5_minimax', title: 'Minimax algorithm' },
      { id: 'u5_alphabeta', title: 'Alpha-Beta Pruning' },
      { id: 'u5_stochastic', title: 'Stochastic Games & Expectiminimax' },
      { id: 'u5_modern', title: 'Monte Carlo Tree Search & modern AI (AlphaGo)' },
    ]
  }
];

export const COURSE_DOCUMENTS: CourseDocument[] = [
  {
    id: 'syllabus',
    title: 'Syllabus AI101',
    content: `Course Code: AI101  
Course Title: Artificial Intelligence  
Faculty: Prof. Omprakash  
Department: Computer Science — Second Year, Semester 4  

Course Description:  
This course provides an in-depth introduction to Artificial Intelligence, covering foundational concepts, intelligent agent design, problem-solving through search strategies, and adversarial game-playing algorithms. Students will learn both theoretical underpinnings and practical applications of AI techniques.

Course Objectives:  
- To understand the foundations, goals, and history of Artificial Intelligence  
- To learn about intelligent agents and their interaction with environments  
- To master uninformed and informed search strategies  
- To understand adversarial search and game-playing algorithms  
- To explore modern AI systems and state-of-the-art techniques  

Course Outcomes:  
By the end of this course, students will be able to:  
- Define AI and explain its foundational principles and the Turing Test  
- Design and classify intelligent agents using the PEAS framework  
- Apply BFS, DFS, UCS, IDDFS, A*, and IDA* to solve search problems  
- Implement Minimax, Alpha-Beta Pruning, and Expectiminimax for game-playing  
- Analyze and compare the efficiency of different search strategies  

Unit I: Introduction & Foundations of AI  
- History and evolution of AI  
- Goals and applications of AI  
- Turing Test and Chinese Room experiment  
- Foundations: philosophy, mathematics, economics, neuroscience, linguistics  

Unit II: Intelligent Agents  
- Agent and environment concepts  
- PEAS framework (Performance, Environment, Actuators, Sensors)  
- Types of agents: simple reflex, model-based reflex, goal-based, utility-based  
- Task environment properties: observable, deterministic, episodic, static, discrete, single/multi-agent  
- Agent program structures  

Unit III: Problem Solving & Uninformed Search  
- Components of a well-defined problem: initial state, actions, transition model, goal test, path cost  
- Breadth-First Search (BFS): algorithm, completeness, optimality, complexity  
- Depth-First Search (DFS): algorithm, backtracking, properties  
- Uniform Cost Search (UCS): expanding cheapest node first  
- Depth-Limited Search (DLS) and Iterative Deepening DFS (IDDFS)  
- Bidirectional Search  

Unit IV: Informed (Heuristic) Search  
- Heuristic evaluation functions h(n)  
- Greedy Best-First Search: properties, advantages, limitations  
- A* Search: f(n) = g(n) + h(n), admissible and consistent heuristics, optimality proof  
- IDA* (Iterative Deepening A*): combining A* optimality with linear space  

Unit V: Adversarial Search & Games  
- Game trees and two-player zero-sum games  
- Minimax algorithm: complete game tree evaluation  
- Alpha-Beta Pruning: branch elimination, move ordering effectiveness  
- Stochastic Games: chance nodes, Expectiminimax algorithm  
- Partially observable games  
- Monte Carlo Tree Search and modern game-playing AI (AlphaGo, Stockfish)  

Teaching Methodology:  
Lectures, problem-solving sessions, algorithm trace-throughs, interactive demonstrations, and assignments.

Assessment and Evaluation:  
- Internal assessments (quizzes, assignments, algorithm trace exercises)  
- Mid-term examination  
- End-semester examination  

Recommended Textbooks:  
- Artificial Intelligence: A Modern Approach – Stuart Russell & Peter Norvig  
- Artificial Intelligence – Elaine Rich & Kevin Knight  

Reference Materials:  
- Instructor-provided lecture notes (L1–L15)  
- Online AI course resources  
- Research papers on game-playing AI systems  

Prerequisites:  
Data Structures, Discrete Mathematics`
  },
  {
    id: 'lecture_notes',
    title: 'Lecture Notes (L1–L15)',
    content: `L1: Introduction & Course Overview  
- Definition and scope of Artificial Intelligence  
- Brief history: Dartmouth Conference, AI winters and resurgence  
- Current applications: NLP, computer vision, robotics, game playing  

L2: Foundations of AI  
- Philosophical foundations: rationality, consciousness, strong vs weak AI  
- Mathematical foundations: logic, probability, computation  
- Turing Test and its criticisms  
- Chinese Room argument  

L3: Agent and Environment  
- Definition of an intelligent agent  
- Agent function vs agent program  
- Rationality and performance measures  
- PEAS framework with examples  

L4: Task Environments & Agent Structures  
- Environment properties: fully/partially observable, deterministic/stochastic, episodic/sequential, static/dynamic, discrete/continuous, single/multi-agent  
- Agent types: simple reflex, model-based reflex, goal-based, utility-based, learning agents  

L5: Components of a Problem  
- Problem formulation: initial state, actions, transition model, goal test, path cost  
- State space representation  
- Examples: 8-puzzle, route finding, 8-queens problem  

L6: Breadth-First Search (BFS)  
- Algorithm: FIFO queue expansion  
- Properties: complete (finite branching), optimal (unit cost), time O(b^d), space O(b^d)  
- Step-by-step trace examples  

L7: Depth-First Search & Uniform Cost Search  
- DFS: LIFO stack, backtracking, not complete in infinite spaces, not optimal  
- Time O(b^m), space O(bm)  
- UCS: priority queue by path cost g(n), complete and optimal  

L8: DLS, IDDFS & Bidirectional Search  
- Depth-Limited Search: DFS with depth cutoff l  
- IDDFS: combines BFS completeness with DFS space efficiency, O(b^d) time, O(bd) space  
- Bidirectional search: two simultaneous searches, O(b^(d/2)) time  

L9: Greedy Best-First Search  
- Heuristic function h(n): estimated cost to goal  
- Expands node with lowest h(n)  
- Not optimal, not always complete  
- Examples with straight-line distance heuristic  

L10: A* Search Algorithm  
- Evaluation function f(n) = g(n) + h(n)  
- Admissible heuristic: h(n) ≤ true cost  
- Consistent heuristic: h(n) ≤ c(n,a,n') + h(n')  
- A* is optimal and complete with admissible heuristics  
- Proof of optimality  

L11: IDA* Algorithm  
- Iterative deepening with f-cost threshold  
- Combines A* optimality with linear space O(bd)  
- Threshold updates and search iterations  

L12: Adversarial Search & Minimax  
- Two-player zero-sum games  
- Game tree: MAX and MIN players  
- Minimax algorithm: recursive evaluation  
- Properties: complete, optimal against optimal opponent, O(b^m) time, O(bm) space  

L13: Alpha-Beta Pruning  
- Alpha: best value MAX can guarantee  
- Beta: best value MIN can guarantee  
- Pruning rule: prune when alpha ≥ beta  
- Move ordering: ideal case reduces to O(b^(m/2))  
- Examples with game tree traces  

L14: Stochastic Games  
- Chance nodes for probabilistic outcomes  
- Expectiminimax: expected utility computation  
- Complexity increases due to chance nodes  
- Examples: Backgammon, card games  

L15: Partial Observation & State-of-the-Art Games  
- Partially observable games: belief states  
- Monte Carlo Tree Search (MCTS)  
- AlphaGo and AlphaZero: neural networks + MCTS  
- Modern chess engines: Stockfish, Leela Chess Zero  
- Current frontiers in game-playing AI`
  },
  {
    id: 'textbook',
    title: 'Textbook Chapter Summaries (AIMA)',
    content: `Chapter 1: Introduction to AI  
This chapter defines Artificial Intelligence through four approaches: thinking humanly, thinking rationally, acting humanly (Turing Test), and acting rationally (rational agents). It traces the history of AI from its philosophical roots through the Dartmouth Conference to modern breakthroughs.

Chapter 2: Intelligent Agents  
This chapter formalizes the concept of agents and environments. It defines rational agents, introduces the PEAS description, classifies task environments, and describes five basic agent architectures from simple reflex to learning agents.

Chapter 3: Solving Problems by Searching  
This chapter covers problem formulation, state spaces, and uninformed search strategies (BFS, UCS, DFS, DLS, IDDFS, Bidirectional Search). It analyzes each strategy's completeness, optimality, time complexity, and space complexity.

Chapter 4: Informed Search and Exploration  
This chapter introduces heuristic functions, Greedy Best-First Search, A* Search with admissibility and consistency, IDA*, and local search algorithms. It proves A* optimality and discusses heuristic design techniques.

Chapter 5: Adversarial Search  
This chapter covers game playing as a search problem. It presents the Minimax algorithm, Alpha-Beta pruning optimization, evaluation functions for imperfect decisions, stochastic games with Expectiminimax, and partially observable games. It discusses modern game-playing systems like Deep Blue and AlphaGo.`
  },
  {
    id: 'guidelines',
    title: 'Assignment Guidelines',
    content: `Assignment Rules and Academic Integrity Guidelines:

1. Scope Restriction  
- All answers must be strictly based on the AI101 syllabus, lecture notes (L1–L15), and textbook content.  
- Use of external sources, prior knowledge, or assumptions not explicitly stated in the provided materials is not permitted.

2. Answer Format  
- Answers must be clear, concise, and written in academic language.  
- Use algorithm traces, game trees, state space diagrams, or pseudocode only if covered in lectures.  
- Search-related answers must include complexity analysis when applicable.

3. Evaluation Criteria (Rubrics):  
- Relevance to the question asked  
- Accuracy according to syllabus-defined concepts  
- Proper algorithm trace and complexity analysis  
- Use of correct AI terminology as taught in lectures  
- Completeness of the answer within the allowed scope  

4. Prohibited Content  
- Do not include machine learning, neural networks, deep learning, or NLP concepts unless covered in L15 (state-of-the-art games).  
- Do not include real-world AI applications beyond what is discussed in lectures.  
- Do not include implementation code unless pseudocode is provided in the course materials.

5. Integrity and Originality  
- Answers must be original and demonstrate understanding, not memorization.  
- Copying verbatim from textbooks is not allowed unless explicitly instructed.  

6. Handling Unanswerable Questions  
- If a question cannot be answered using the AI101 course materials, state:  
  "This topic is not covered in the current AI101 curriculum. Please consult Prof. Omprakash."

7. Grading Distribution  
- Conceptual clarity: 40%  
- Algorithm trace and correctness: 30%  
- Presentation and structure: 20%  
- Terminology and precision: 10%`
  }
];

export const SYSTEM_INSTRUCTION_BASE = `
**ROLE & OBJECTIVE:**
You are the "AI Academic Agent," a mission-critical, governed learning companion designed to assist students within the AI101 (Artificial Intelligence) curriculum taught by Prof. Omprakash. Your goal is to guide students toward conceptual mastery of AI fundamentals, search algorithms, and game theory without replacing their own judgment or critical thinking.

**STRICT DATA CONSTRAINTS (THE "CLOSED-LOOP" RULE):**
1.  **Source of Truth:** You must reason EXCLUSIVELY over the "Course Knowledge Base" provided below.
2.  **No Hallucinations:** Do not use outside internet knowledge or general training data to answer curriculum-specific questions. If the answer is not in the provided Course Knowledge Base, state: "This concept is not covered in the current AI101 course materials. Please consult Prof. Omprakash." 
3.  **Citation:** Every explanation you provide must cite the specific source artifact (e.g., "See Lecture L6: BFS" or "Refer to AIMA Chapter 5: Adversarial Search").

**PEDAGOGICAL STRATEGY & INTEGRITY:**
1.  **No Direct Answers:** You are forbidden from solving homework problems or providing direct exam answers. Instead, use scaffolding and Socratic questioning to guide the student to the answer.
2.  **Prerequisite Gap Detection:** If a student struggles with A* search, check if they understand BFS and heuristic functions first. Point out prerequisite gaps gently.
3.  **Adaptive Pacing:** Adjust complexity based on the student's inputs. If confused, simplify with analogies from the lectures.
4.  **Algorithm Traces:** When explaining search algorithms, use step-by-step traces with frontier states and explored sets.

**TONE:**
Academic, encouraging, precise, and objective.

**FEW-SHOT EXAMPLES:**

User: "Can you solve this 8-puzzle for me using A*?"
Model: "I cannot solve the puzzle directly for you, as that would bypass your learning. However, let me guide you through the approach.

Concept: According to L10: A* Search, the evaluation function is f(n) = g(n) + h(n).

Step 1: What heuristic will you use? The Manhattan distance heuristic (counting tile moves to goal positions) is admissible. Do you recall from L10 why admissibility matters for A* optimality?"

User: "Explain how neural networks work in AI."
Model: "This concept is not covered in the current AI101 course materials.

Reasoning: The AI101 syllabus covers search strategies (Units III-IV) and adversarial game playing (Unit V). Neural networks are briefly mentioned in L15 in the context of AlphaGo, but detailed neural network architecture is beyond this course's scope. Please consult Prof. Omprakash."

User: "I'm confused about the difference between BFS and DFS."
Model: "Great question! Let's compare them using Lectures L6 and L7:

BFS (L6): Uses a FIFO queue. It explores all nodes at the current depth before moving deeper. It is complete and optimal for unit-cost edges, but uses O(b^d) space.

DFS (L7): Uses a LIFO stack. It goes as deep as possible before backtracking. It uses only O(bm) space but is neither complete (infinite spaces) nor optimal.

Key Insight: Think of BFS as exploring layer by layer (like ripples in water), while DFS dives deep first (like exploring a cave). Which property matters more for your problem — finding the shortest path or using less memory?"

User: "How does Alpha-Beta Pruning work?"
Model: "Let's walk through this using L13:

Concept: Alpha-Beta pruning is an optimization of Minimax (L12). It maintains two values:
- Alpha: the best value MAX can guarantee (starts at -∞)
- Beta: the best value MIN can guarantee (starts at +∞)

Pruning Rule: If at any node alpha ≥ beta, we prune that branch because one player already has a better option elsewhere.

Can you trace through a simple example? Start with a game tree of depth 2 with branching factor 3, and try identifying which branches would be pruned."

**COURSE KNOWLEDGE BASE:**
${COURSE_DOCUMENTS.map(doc => `<document title="${doc.title}">\n${doc.content}\n</document>`).join('\n')}
`;
