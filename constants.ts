import { CourseDocument, CurriculumUnit } from './types';

export const CURRICULUM_DATA: CurriculumUnit[] = [
  {
    id: 'unit_1',
    title: 'Unit I: Introduction to Computer Systems',
    topics: [
      { id: 'u1_history', title: 'History and evolution of computers' },
      { id: 'u1_types', title: 'Types of computers' },
      { id: 'u1_components', title: 'Hardware and software components' },
      { id: 'u1_software', title: 'System software and application software' },
    ]
  },
  {
    id: 'unit_2',
    title: 'Unit II: Problem Solving and Algorithms',
    topics: [
      { id: 'u2_techniques', title: 'Problem-solving techniques' },
      { id: 'u2_algo_def', title: 'Algorithms: definition and characteristics' },
      { id: 'u2_flowcharts', title: 'Flowcharts and pseudocode' },
      { id: 'u2_thinking', title: 'Introduction to computational thinking' },
    ]
  },
  {
    id: 'unit_3',
    title: 'Unit III: Programming Fundamentals',
    topics: [
      { id: 'u3_intro', title: 'Introduction to programming languages' },
      { id: 'u3_variables', title: 'Variables, data types, and operators' },
      { id: 'u3_io', title: 'Input and output statements' },
      { id: 'u3_conditional', title: 'Conditional statements (if, if-else, switch)' },
    ]
  },
  {
    id: 'unit_4',
    title: 'Unit IV: Control Structures',
    topics: [
      { id: 'u4_loops', title: 'Looping constructs (for, while, do-while)' },
      { id: 'u4_nested', title: 'Nested loops' },
      { id: 'u4_break', title: 'Break and continue statements' },
      { id: 'u4_debug', title: 'Basic debugging techniques' },
    ]
  },
  {
    id: 'unit_5',
    title: 'Unit V: Introduction to Data Structures',
    topics: [
      { id: 'u5_arrays', title: 'Arrays and strings' },
      { id: 'u5_functions', title: 'Basic concepts of functions' },
      { id: 'u5_lists', title: 'Introduction to lists and tuples' },
      { id: 'u5_stacks', title: 'Overview of stacks and queues' },
    ]
  }
];

export const COURSE_DOCUMENTS: CourseDocument[] = [
  {
    id: 'syllabus',
    title: 'Syllabus CS101',
    content: `Course Code: CS101  
Course Title: Introduction to Computer Science  

Course Description:  
This course provides an introduction to the fundamental concepts of computer science. It covers problem-solving techniques, algorithmic thinking, basic programming concepts, data representation, and an overview of computer systems. The course is designed for beginners with no prior programming experience.

Course Objectives:  
- To understand the basic principles of computer science  
- To develop logical and algorithmic problem-solving skills  
- To gain familiarity with programming fundamentals  
- To understand how data is represented and processed in computers  
- To introduce foundational concepts used in advanced computing subjects  

Course Outcomes:  
By the end of this course, students will be able to:  
- Explain core computer science concepts and terminology  
- Design simple algorithms using flowcharts and pseudocode  
- Write basic programs using a high-level programming language  
- Apply conditional statements and loops to solve problems  
- Understand basic data structures and their applications  

Unit I: Introduction to Computer Systems  
- History and evolution of computers  
- Types of computers  
- Hardware and software components  
- System software and application software  

Unit II: Problem Solving and Algorithms  
- Problem-solving techniques  
- Algorithms: definition and characteristics  
- Flowcharts and pseudocode  
- Introduction to computational thinking  

Unit III: Programming Fundamentals  
- Introduction to programming languages  
- Variables, data types, and operators  
- Input and output statements  
- Conditional statements (if, if-else, switch)  

Unit IV: Control Structures  
- Looping constructs (for, while, do-while)  
- Nested loops  
- Break and continue statements  
- Basic debugging techniques  

Unit V: Introduction to Data Structures  
- Arrays and strings  
- Basic concepts of functions  
- Introduction to lists and tuples (if applicable)  
- Overview of stacks and queues  

Teaching Methodology:  
Lectures, practical demonstrations, hands-on programming exercises, assignments, and quizzes.

Assessment and Evaluation:  
- Internal assessments (quizzes, assignments, practicals)  
- Mid-term examination  
- End-semester examination  

Recommended Textbooks:  
- Introduction to Computer Science using Python – Charles Dierbach  
- Computer Science: An Overview – J. Glenn Brookshear  

Reference Materials:  
- Online programming documentation  
- Instructor-provided lecture notes  
- Educational coding platforms  

Prerequisites:  
None`
  },
  {
    id: 'lecture_notes',
    title: 'Lecture Notes (Week 1-5)',
    content: `Week 1: Introduction to Computer Science  
- Definition of computer science  
- Applications of computers in daily life  
- Components of a computer system: input devices, output devices, CPU, memory  
- Hardware vs software  
- Types of software: system software and application software  

Week 2: Computer Fundamentals  
- Generations of computers  
- Classification of computers: supercomputers, mainframes, minicomputers, microcomputers  
- Operating systems: functions and examples  
- Basics of file systems  
- Introduction to open-source and proprietary software  

Week 3: Problem Solving and Algorithms  
- Understanding a problem statement  
- Steps in problem solving  
- Definition of algorithm  
- Characteristics of a good algorithm: finiteness, definiteness, effectiveness  
- Examples of simple algorithms  
- Introduction to flowcharts and standard symbols  

Week 4: Programming Basics  
- Introduction to programming languages  
- Types of programming languages: low-level and high-level  
- Introduction to Python / C (generic programming concepts)  
- Variables and constants  
- Data types: integer, float, character, string, boolean  
- Operators: arithmetic, relational, logical  

Week 5: Control Structures  
- Conditional statements: if, if-else, nested if  
- Looping constructs: for loop, while loop  
- Difference between entry-controlled and exit-controlled loops  
- Use of break and continue  
- Common programming errors and debugging basics`
  },
  {
    id: 'textbook',
    title: 'Textbook Chapter Summaries',
    content: `Chapter 1: Introduction to Computers  
This chapter explains the concept of computers, their evolution, and their role in modern society. It discusses the basic organization of a computer system and the interaction between hardware and software components.

Chapter 2: Data and Information  
This chapter focuses on the difference between data and information. It introduces number systems, data representation, and the importance of accuracy and processing in computing systems.

Chapter 3: Problem Solving Using Computers  
This chapter introduces structured problem-solving approaches. It explains algorithms, flowcharts, and pseudocode as tools to represent solutions before coding.

Chapter 4: Programming Concepts  
This chapter covers fundamental programming concepts such as variables, constants, data types, operators, and expressions. It emphasizes writing clear and efficient code.

Chapter 5: Control Structures  
This chapter explains decision-making and looping statements. It describes how conditional and repetitive structures control the flow of a program and includes examples for better understanding.

Chapter 6: Introduction to Data Structures  
This chapter provides a basic overview of data structures such as arrays and strings. It introduces the concept of organizing data efficiently for better performance.`
  },
  {
    id: 'guidelines',
    title: 'Assignment Guidelines',
    content: `Assignment Rules and Academic Integrity Guidelines:

1. Scope Restriction  
- All answers must be strictly based on the content provided in the course syllabus, lecture notes, and textbook excerpts included in the course knowledge base.  
- Use of external sources, prior knowledge, or assumptions not explicitly stated in the provided materials is not permitted.

2. Answer Format  
- Answers must be clear, concise, and written in simple academic language.  
- Use bullet points, diagrams, flowcharts, or pseudocode only if they are covered in the lecture notes or textbook summaries.  
- Programming-related answers must follow the concepts taught in class and avoid advanced features not introduced in the syllabus.

3. Evaluation Criteria (Rubrics):  
Each question will be evaluated based on the following parameters:  
- Relevance to the question asked  
- Accuracy according to syllabus-defined concepts  
- Logical explanation and clarity  
- Proper use of terminology as taught in lectures  
- Completeness of the answer within the allowed scope  

4. Prohibited Content  
- Do not include examples, case studies, libraries, functions, or syntax not mentioned in the provided learning materials.  
- Do not include real-world applications unless explicitly asked and covered in the syllabus.  
- Do not include optimization techniques or advanced concepts beyond the course level.

5. Integrity and Originality  
- Answers must be original and written in the student’s own words.  
- Copying verbatim from textbooks or external sources is not allowed unless explicitly instructed.  
- Any attempt to bypass syllabus restrictions will be considered a violation of academic integrity.

6. Handling Unanswerable Questions  
- If a question cannot be answered using the provided course materials, the response must clearly state:  
  “This question cannot be answered based on the provided course content.”  

7. Grading Distribution  
- Conceptual clarity: 40%  
- Correctness and relevance: 30%  
- Presentation and structure: 20%  
- Language and terminology: 10%  

8. Instructor Expectations  
- Students are expected to demonstrate understanding, not memorization.  
- Partial credit may be awarded for logically correct but incomplete answers within syllabus scope.  
- Answers exceeding syllabus depth may be penalized.`
  }
];

export const SYSTEM_INSTRUCTION_BASE = `
**ROLE & OBJECTIVE:**
You are the "University Academic Agent," a mission-critical, governed learning companion designed to assist students within the CS101 curriculum. Your goal is to guide students toward conceptual mastery without replacing their own judgment or critical thinking.

**STRICT DATA CONSTRAINTS (THE "CLOSED-LOOP" RULE):**
1.  **Source of Truth:** You must reason EXCLUSIVELY over the "Course Knowledge Base" provided below.
2.  **No Hallucinations:** Do not use outside internet knowledge or general training data to answer curriculum-specific questions. If the answer is not in the provided Course Knowledge Base, state: "This concept is not covered in the current provided course materials. Please consult your professor." 
3.  **Citation:** Every explanation you provide must cite the specific source artifact (e.g., "See Lecture Notes Week 1" or "Refer to Textbook Chapter 4").

**PEDAGOGICAL STRATEGY & INTEGRITY:**
1.  **No Direct Answers:** You are forbidden from solving homework problems, writing essays, or providing direct exam answers. Instead, use scaffolding and Socratic questioning to guide the student to the answer.
2.  **Prerequisite Gap Detection:** If a student struggles with a concept, analyze if they are missing a prerequisite concept from earlier in the provided curriculum. Point this out gently.
3.  **Adaptive Pacing:** Adjust your complexity based on the student's inputs. If they seem confused, simplify the language and offer an analogy from the text if available.
4.  **Accessibility:** Prioritize accessibility. If a student requests, provide text-based descriptions of visual concepts or summarize long passages into bullet points.

**TONE:**
Academic, encouraging, precise, and objective.

**FEW-SHOT EXAMPLES:**

User: "Can you write the code for my assignment to sort a list of names?"
Model: "I cannot write the code for you, as strictly writing the program violates the Originality and Integrity guidelines. However, I can help you design the logic.

Concept: According to Unit V, we cover 'Arrays and Strings'. To sort, you would typically compare elements.

Logic: Do you recall the 'Relational Operators' we discussed in Week 4? You will need to use those inside a loop to compare the names alphabetically."

User: "How do I use a Dictionary in Python to store student grades?"
Model: "This question cannot be answered based on the provided course content.

Reasoning: The Unit V syllabus covers Arrays, Strings, and an introduction to Lists/Tuples, but 'Dictionaries' are not explicitly listed in the provided Week 1-5 or Unit I-V content. Please consult your instructor for advanced data structures."

User: "I'm confused about how an 'Algorithm' is different from a program."
Model: "That is a great foundational question. Based on Week 3: Problem Solving and Algorithms:

Definition: An algorithm is a step-by-step solution defined by characteristics like 'finiteness' and 'definiteness'. It is a plan, often represented by flowcharts.

Distinction: A program is the actual code written in a high-level language (like Python) mentioned in Unit III.

Analogy: Think of the algorithm as the recipe and the program as the cooking process."

User: "Why is my 'if' statement not working? It never runs the 'else' block."
Model: "Let's troubleshoot this using Week 5: Control Structures.

Gap Check: The 'else' block only executes when the 'if' condition evaluates to False. This relies on understanding Boolean data types (True/False) from Week 4.

Next Step: Check your relational operators. Are you accidentally using an assignment operator (=) instead of a comparison operator (==)?."

User: "Explain how Artificial Intelligence works in self-driving cars."
Model: "While Week 1 mentions 'Applications of computers in daily life', specific technical details regarding Artificial Intelligence and self-driving car architecture are not covered in this Intro to Computer Science syllabus. I can only discuss the basic hardware/software components involved, such as input devices (sensors) and processing."

**COURSE KNOWLEDGE BASE:**
${COURSE_DOCUMENTS.map(doc => `<document title="${doc.title}">\n${doc.content}\n</document>`).join('\n')}
`;