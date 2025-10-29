// Comprehensive question bank with multiple sets for variety
export interface Question {
  id: string
  text: string
  expectedAnswer?: string
  timeLimit?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
}

export interface QuestionSet {
  id: string
  name: string
  description: string
  questions: Question[]
}

// Section A: Short Questions (Personal & Professional)
export const SECTION_A_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_a_1',
    name: 'Personal Introduction',
    description: 'Basic personal and professional questions',
    questions: [
      {
        id: 'a1_1',
        text: 'Tell me about yourself in one sentence.',
        expectedAnswer: 'name, profession, experience, goals',
        timeLimit: 30,
        difficulty: 'easy'
      },
      {
        id: 'a1_2',
        text: 'What are your career goals?',
        expectedAnswer: 'career objectives, professional development, future plans',
        timeLimit: 30,
        difficulty: 'medium'
      },
      {
        id: 'a1_3',
        text: 'Why do you want to join our company?',
        expectedAnswer: 'company interest, motivation, alignment with values',
        timeLimit: 30,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_a_2',
    name: 'Skills & Experience',
    description: 'Questions about professional skills and background',
    questions: [
      {
        id: 'a2_1',
        text: 'What is your greatest professional strength?',
        expectedAnswer: 'specific skill, examples, professional capability',
        timeLimit: 30,
        difficulty: 'medium'
      },
      {
        id: 'a2_2',
        text: 'Describe your educational background briefly.',
        expectedAnswer: 'education, qualifications, relevant studies',
        timeLimit: 30,
        difficulty: 'easy'
      },
      {
        id: 'a2_3',
        text: 'What motivates you in your work?',
        expectedAnswer: 'motivation, passion, work drivers',
        timeLimit: 30,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_a_3',
    name: 'Personal Values',
    description: 'Questions about personal characteristics and values',
    questions: [
      {
        id: 'a3_1',
        text: 'How would your friends describe you?',
        expectedAnswer: 'personality traits, characteristics, social qualities',
        timeLimit: 30,
        difficulty: 'easy'
      },
      {
        id: 'a3_2',
        text: 'What is most important to you in life?',
        expectedAnswer: 'values, priorities, life philosophy',
        timeLimit: 30,
        difficulty: 'medium'
      },
      {
        id: 'a3_3',
        text: 'Describe your ideal work environment.',
        expectedAnswer: 'work preferences, environment, team dynamics',
        timeLimit: 30,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_a_4',
    name: 'Future Aspirations',
    description: 'Questions about future plans and aspirations',
    questions: [
      {
        id: 'a4_1',
        text: 'Where do you see yourself in five years?',
        expectedAnswer: 'future goals, career progression, personal development',
        timeLimit: 30,
        difficulty: 'medium'
      },
      {
        id: 'a4_2',
        text: 'What skills would you like to develop?',
        expectedAnswer: 'skill development, learning goals, professional growth',
        timeLimit: 30,
        difficulty: 'medium'
      },
      {
        id: 'a4_3',
        text: 'What does success mean to you?',
        expectedAnswer: 'success definition, achievements, personal meaning',
        timeLimit: 30,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_a_5',
    name: 'Work Preferences',
    description: 'Questions about work style and preferences',
    questions: [
      {
        id: 'a5_1',
        text: 'Do you prefer working alone or in a team?',
        expectedAnswer: 'work style preference, collaboration, independence',
        timeLimit: 30,
        difficulty: 'easy'
      },
      {
        id: 'a5_2',
        text: 'How do you handle pressure at work?',
        expectedAnswer: 'stress management, coping strategies, resilience',
        timeLimit: 30,
        difficulty: 'medium'
      },
      {
        id: 'a5_3',
        text: 'What type of projects interest you most?',
        expectedAnswer: 'project preferences, interests, professional passion',
        timeLimit: 30,
        difficulty: 'medium'
      }
    ]
  }
]

// Section B: Situational Questions
export const SECTION_B_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_b_1',
    name: 'Problem Solving',
    description: 'Situations requiring problem-solving skills',
    questions: [
      {
        id: 'b1_1',
        text: 'Describe a challenging situation you faced at work and how you resolved it.',
        expectedAnswer: 'situation description, problem analysis, solution, outcome',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b1_2',
        text: 'Tell me about a time when you had to learn something new quickly.',
        expectedAnswer: 'learning challenge, approach, methods, results',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b1_3',
        text: 'How do you handle conflicting priorities in your work?',
        expectedAnswer: 'prioritization methods, time management, decision making',
        timeLimit: 60,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_b_2',
    name: 'Leadership & Teamwork',
    description: 'Situations involving leadership and collaboration',
    questions: [
      {
        id: 'b2_1',
        text: 'Describe a time when you had to work with a difficult team member.',
        expectedAnswer: 'team conflict, communication, resolution, collaboration',
        timeLimit: 60,
        difficulty: 'hard'
      },
      {
        id: 'b2_2',
        text: 'Tell me about a project where you took the lead.',
        expectedAnswer: 'leadership experience, project management, team coordination',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b2_3',
        text: 'How do you motivate team members who are struggling?',
        expectedAnswer: 'motivation techniques, support methods, team building',
        timeLimit: 60,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_b_3',
    name: 'Communication Challenges',
    description: 'Situations requiring strong communication skills',
    questions: [
      {
        id: 'b3_1',
        text: 'Describe a time when you had to explain something complex to someone.',
        expectedAnswer: 'communication challenge, explanation methods, clarity, understanding',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b3_2',
        text: 'Tell me about a time when you received criticism. How did you handle it?',
        expectedAnswer: 'feedback reception, emotional response, improvement actions',
        timeLimit: 60,
        difficulty: 'hard'
      },
      {
        id: 'b3_3',
        text: 'How do you handle disagreements with your supervisor?',
        expectedAnswer: 'conflict resolution, professional communication, respect',
        timeLimit: 60,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_b_4',
    name: 'Adaptability & Change',
    description: 'Situations involving change and adaptation',
    questions: [
      {
        id: 'b4_1',
        text: 'Describe a time when you had to adapt to a major change at work.',
        expectedAnswer: 'change situation, adaptation process, flexibility, outcome',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b4_2',
        text: 'Tell me about a mistake you made and how you handled it.',
        expectedAnswer: 'mistake acknowledgment, responsibility, corrective action, learning',
        timeLimit: 60,
        difficulty: 'hard'
      },
      {
        id: 'b4_3',
        text: 'How do you stay updated with changes in your field?',
        expectedAnswer: 'continuous learning, professional development, industry awareness',
        timeLimit: 60,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_b_5',
    name: 'Achievement & Success',
    description: 'Situations showcasing achievements and success',
    questions: [
      {
        id: 'b5_1',
        text: 'Tell me about your greatest professional achievement.',
        expectedAnswer: 'achievement description, effort, impact, recognition',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b5_2',
        text: 'Describe a time when you exceeded expectations.',
        expectedAnswer: 'expectations, extra effort, results, recognition',
        timeLimit: 60,
        difficulty: 'medium'
      },
      {
        id: 'b5_3',
        text: 'How do you measure success in your work?',
        expectedAnswer: 'success metrics, evaluation criteria, personal standards',
        timeLimit: 60,
        difficulty: 'hard'
      }
    ]
  }
]

// Section C: Read Aloud (Pronunciation)
export const SECTION_C_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_c_1',
    name: 'Business Communication',
    description: 'Professional and business-related sentences',
    questions: [
      {
        id: 'c1_1',
        text: 'The quarterly financial report demonstrates significant growth in our international markets.',
        expectedAnswer: 'clear pronunciation, proper stress, business vocabulary',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'c1_2',
        text: 'Effective communication is essential for successful project management and team collaboration.',
        expectedAnswer: 'clear articulation, professional vocabulary, proper intonation',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'c1_3',
        text: 'The implementation of innovative technologies requires comprehensive training and strategic planning.',
        expectedAnswer: 'complex vocabulary, clear pronunciation, technical terms',
        timeLimit: 15,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_c_2',
    name: 'Academic Content',
    description: 'Educational and academic sentences',
    questions: [
      {
        id: 'c2_1',
        text: 'Research methodology involves systematic investigation and analysis of empirical data.',
        expectedAnswer: 'academic vocabulary, clear pronunciation, proper stress',
        timeLimit: 15,
        difficulty: 'hard'
      },
      {
        id: 'c2_2',
        text: 'Students must demonstrate critical thinking skills through comprehensive analysis and evaluation.',
        expectedAnswer: 'educational terms, clear articulation, proper rhythm',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'c2_3',
        text: 'The hypothesis was validated through rigorous experimentation and statistical analysis.',
        expectedAnswer: 'scientific vocabulary, precise pronunciation, technical accuracy',
        timeLimit: 15,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_c_3',
    name: 'General Knowledge',
    description: 'Common knowledge and everyday topics',
    questions: [
      {
        id: 'c3_1',
        text: 'Regular exercise and balanced nutrition contribute significantly to overall health and well-being.',
        expectedAnswer: 'clear pronunciation, natural rhythm, health vocabulary',
        timeLimit: 15,
        difficulty: 'easy'
      },
      {
        id: 'c3_2',
        text: 'Environmental conservation requires collective effort and sustainable practices from all communities.',
        expectedAnswer: 'environmental terms, clear articulation, proper stress',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'c3_3',
        text: 'Technology has revolutionized communication methods and transformed global business operations.',
        expectedAnswer: 'technology vocabulary, clear pronunciation, proper intonation',
        timeLimit: 15,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_c_4',
    name: 'Complex Sentences',
    description: 'Challenging sentences with complex structures',
    questions: [
      {
        id: 'c4_1',
        text: 'Notwithstanding the unprecedented circumstances, the organization maintained its commitment to excellence.',
        expectedAnswer: 'complex vocabulary, formal language, clear pronunciation',
        timeLimit: 15,
        difficulty: 'hard'
      },
      {
        id: 'c4_2',
        text: 'The multifaceted approach encompasses various methodologies and interdisciplinary perspectives.',
        expectedAnswer: 'academic language, complex terms, proper articulation',
        timeLimit: 15,
        difficulty: 'hard'
      },
      {
        id: 'c4_3',
        text: 'Consequently, the implementation necessitated comprehensive restructuring and systematic optimization.',
        expectedAnswer: 'formal vocabulary, complex structure, precise pronunciation',
        timeLimit: 15,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_c_5',
    name: 'Professional Scenarios',
    description: 'Workplace and professional context sentences',
    questions: [
      {
        id: 'c5_1',
        text: 'The client presentation requires thorough preparation and professional delivery techniques.',
        expectedAnswer: 'business vocabulary, clear pronunciation, professional tone',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'c5_2',
        text: 'Quality assurance protocols ensure consistent standards and customer satisfaction.',
        expectedAnswer: 'quality terms, clear articulation, business language',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'c5_3',
        text: 'Strategic partnerships facilitate market expansion and competitive advantage development.',
        expectedAnswer: 'strategic vocabulary, business terms, clear pronunciation',
        timeLimit: 15,
        difficulty: 'hard'
      }
    ]
  }
]

// Section D: Repeat Sentences
export const SECTION_D_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_d_1',
    name: 'Simple Sentences',
    description: 'Basic sentence structures for repetition',
    questions: [
      {
        id: 'd1_1',
        text: 'The meeting is scheduled for tomorrow morning.',
        expectedAnswer: 'exact repetition, clear pronunciation, proper rhythm',
        timeLimit: 10,
        difficulty: 'easy'
      },
      {
        id: 'd1_2',
        text: 'Please submit your report by Friday afternoon.',
        expectedAnswer: 'accurate repetition, clear articulation, natural flow',
        timeLimit: 10,
        difficulty: 'easy'
      },
      {
        id: 'd1_3',
        text: 'The project deadline has been extended until next week.',
        expectedAnswer: 'complete repetition, proper stress, clear pronunciation',
        timeLimit: 10,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_d_2',
    name: 'Medium Complexity',
    description: 'Moderately complex sentences for repetition',
    questions: [
      {
        id: 'd2_1',
        text: 'The comprehensive analysis revealed significant opportunities for improvement.',
        expectedAnswer: 'accurate repetition, complex vocabulary, proper intonation',
        timeLimit: 12,
        difficulty: 'medium'
      },
      {
        id: 'd2_2',
        text: 'Effective leadership requires strong communication and decision-making skills.',
        expectedAnswer: 'complete repetition, professional vocabulary, clear delivery',
        timeLimit: 12,
        difficulty: 'medium'
      },
      {
        id: 'd2_3',
        text: 'The innovative solution addresses multiple challenges simultaneously and efficiently.',
        expectedAnswer: 'exact repetition, technical terms, proper rhythm',
        timeLimit: 12,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_d_3',
    name: 'Complex Sentences',
    description: 'Challenging sentences with complex structures',
    questions: [
      {
        id: 'd3_1',
        text: 'The interdisciplinary approach facilitates comprehensive understanding and innovative problem-solving methodologies.',
        expectedAnswer: 'accurate repetition, academic vocabulary, complex structure',
        timeLimit: 15,
        difficulty: 'hard'
      },
      {
        id: 'd3_2',
        text: 'Sustainable development initiatives require collaborative efforts and long-term strategic planning.',
        expectedAnswer: 'complete repetition, environmental terms, proper articulation',
        timeLimit: 15,
        difficulty: 'hard'
      },
      {
        id: 'd3_3',
        text: 'The implementation of advanced technologies necessitates comprehensive training and systematic adaptation.',
        expectedAnswer: 'exact repetition, technical vocabulary, complex pronunciation',
        timeLimit: 15,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_d_4',
    name: 'Professional Context',
    description: 'Business and professional sentences',
    questions: [
      {
        id: 'd4_1',
        text: 'Customer satisfaction surveys indicate positive feedback regarding service quality.',
        expectedAnswer: 'accurate repetition, business terms, professional delivery',
        timeLimit: 12,
        difficulty: 'medium'
      },
      {
        id: 'd4_2',
        text: 'The quarterly performance review demonstrates consistent progress and achievement.',
        expectedAnswer: 'complete repetition, performance vocabulary, clear pronunciation',
        timeLimit: 12,
        difficulty: 'medium'
      },
      {
        id: 'd4_3',
        text: 'Strategic partnerships enhance market positioning and competitive advantage.',
        expectedAnswer: 'exact repetition, strategic vocabulary, business language',
        timeLimit: 12,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_d_5',
    name: 'Technical Content',
    description: 'Technical and specialized vocabulary',
    questions: [
      {
        id: 'd5_1',
        text: 'Data analysis reveals significant correlations between variables and outcomes.',
        expectedAnswer: 'accurate repetition, analytical terms, technical pronunciation',
        timeLimit: 12,
        difficulty: 'medium'
      },
      {
        id: 'd5_2',
        text: 'The algorithm optimization process improves efficiency and reduces computational complexity.',
        expectedAnswer: 'complete repetition, technical vocabulary, precise articulation',
        timeLimit: 15,
        difficulty: 'hard'
      },
      {
        id: 'd5_3',
        text: 'Quality control mechanisms ensure compliance with industry standards and regulations.',
        expectedAnswer: 'exact repetition, quality terms, professional delivery',
        timeLimit: 12,
        difficulty: 'medium'
      }
    ]
  }
]

// Section E: Answer Questions
export const SECTION_E_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_e_1',
    name: 'Factual Questions',
    description: 'Questions requiring factual information',
    questions: [
      {
        id: 'e1_1',
        text: 'What is the capital city of Australia?',
        expectedAnswer: 'Canberra',
        timeLimit: 10,
        difficulty: 'easy'
      },
      {
        id: 'e1_2',
        text: 'How many days are there in a leap year?',
        expectedAnswer: '366 days',
        timeLimit: 10,
        difficulty: 'easy'
      },
      {
        id: 'e1_3',
        text: 'What is the largest ocean on Earth?',
        expectedAnswer: 'Pacific Ocean',
        timeLimit: 10,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'set_e_2',
    name: 'Business Knowledge',
    description: 'Questions about business and professional topics',
    questions: [
      {
        id: 'e2_1',
        text: 'What does ROI stand for in business?',
        expectedAnswer: 'Return on Investment',
        timeLimit: 10,
        difficulty: 'medium'
      },
      {
        id: 'e2_2',
        text: 'What is the primary purpose of a business plan?',
        expectedAnswer: 'planning strategy, securing funding, guiding operations',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'e2_3',
        text: 'What is market research used for?',
        expectedAnswer: 'understanding customers, analyzing competition, identifying opportunities',
        timeLimit: 15,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_e_3',
    name: 'General Knowledge',
    description: 'Common knowledge questions',
    questions: [
      {
        id: 'e3_1',
        text: 'What is the chemical symbol for gold?',
        expectedAnswer: 'Au',
        timeLimit: 10,
        difficulty: 'medium'
      },
      {
        id: 'e3_2',
        text: 'Which planet is known as the Red Planet?',
        expectedAnswer: 'Mars',
        timeLimit: 10,
        difficulty: 'easy'
      },
      {
        id: 'e3_3',
        text: 'What is the speed of light in a vacuum?',
        expectedAnswer: '299,792,458 meters per second or approximately 300,000 kilometers per second',
        timeLimit: 15,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_e_4',
    name: 'Academic Topics',
    description: 'Educational and academic questions',
    questions: [
      {
        id: 'e4_1',
        text: 'What is the difference between qualitative and quantitative research?',
        expectedAnswer: 'qualitative uses descriptive data, quantitative uses numerical data',
        timeLimit: 20,
        difficulty: 'hard'
      },
      {
        id: 'e4_2',
        text: 'What is the scientific method?',
        expectedAnswer: 'systematic approach, hypothesis, experimentation, analysis, conclusion',
        timeLimit: 20,
        difficulty: 'medium'
      },
      {
        id: 'e4_3',
        text: 'What is critical thinking?',
        expectedAnswer: 'analytical thinking, evaluation, reasoning, problem-solving',
        timeLimit: 20,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_e_5',
    name: 'Technology & Innovation',
    description: 'Questions about technology and modern topics',
    questions: [
      {
        id: 'e5_1',
        text: 'What is artificial intelligence?',
        expectedAnswer: 'computer systems, human intelligence, machine learning, automation',
        timeLimit: 20,
        difficulty: 'medium'
      },
      {
        id: 'e5_2',
        text: 'What is cloud computing?',
        expectedAnswer: 'internet-based computing, remote servers, data storage, online services',
        timeLimit: 20,
        difficulty: 'medium'
      },
      {
        id: 'e5_3',
        text: 'What is the Internet of Things (IoT)?',
        expectedAnswer: 'connected devices, internet connectivity, data exchange, smart technology',
        timeLimit: 20,
        difficulty: 'hard'
      }
    ]
  }
]

// Section F: Sentence Builds
export const SECTION_F_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_f_1',
    name: 'Simple Constructions',
    description: 'Basic sentence building exercises',
    questions: [
      {
        id: 'f1_1',
        text: 'Build a sentence using: she / goes / school / every day',
        expectedAnswer: 'She goes to school every day',
        timeLimit: 15,
        difficulty: 'easy'
      },
      {
        id: 'f1_2',
        text: 'Build a sentence using: they / finished / project / last week',
        expectedAnswer: 'They finished the project last week',
        timeLimit: 15,
        difficulty: 'easy'
      },
      {
        id: 'f1_3',
        text: 'Build a sentence using: we / will / meeting / tomorrow',
        expectedAnswer: 'We will have a meeting tomorrow',
        timeLimit: 15,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_f_2',
    name: 'Professional Context',
    description: 'Business and professional sentence building',
    questions: [
      {
        id: 'f2_1',
        text: 'Build a sentence using: team / completed / successfully / project',
        expectedAnswer: 'The team completed the project successfully',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'f2_2',
        text: 'Build a sentence using: manager / approved / budget / proposal',
        expectedAnswer: 'The manager approved the budget proposal',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'f2_3',
        text: 'Build a sentence using: company / implementing / new / strategy',
        expectedAnswer: 'The company is implementing a new strategy',
        timeLimit: 15,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_f_3',
    name: 'Complex Structures',
    description: 'Advanced sentence construction',
    questions: [
      {
        id: 'f3_1',
        text: 'Build a sentence using: although / challenging / project / successful',
        expectedAnswer: 'Although the project was challenging, it was successful',
        timeLimit: 20,
        difficulty: 'hard'
      },
      {
        id: 'f3_2',
        text: 'Build a sentence using: because / preparation / presentation / effective',
        expectedAnswer: 'Because of thorough preparation, the presentation was effective',
        timeLimit: 20,
        difficulty: 'hard'
      },
      {
        id: 'f3_3',
        text: 'Build a sentence using: not only / innovative / but also / practical',
        expectedAnswer: 'The solution is not only innovative but also practical',
        timeLimit: 20,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_f_4',
    name: 'Academic Language',
    description: 'Educational and academic sentence building',
    questions: [
      {
        id: 'f4_1',
        text: 'Build a sentence using: research / demonstrates / significant / improvement',
        expectedAnswer: 'The research demonstrates significant improvement',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'f4_2',
        text: 'Build a sentence using: students / analysis / critical / skills',
        expectedAnswer: 'Students develop critical analysis skills',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'f4_3',
        text: 'Build a sentence using: methodology / comprehensive / evaluation / requires',
        expectedAnswer: 'The methodology requires comprehensive evaluation',
        timeLimit: 20,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_f_5',
    name: 'Technical Vocabulary',
    description: 'Technical and specialized sentence building',
    questions: [
      {
        id: 'f5_1',
        text: 'Build a sentence using: system / optimization / performance / improves',
        expectedAnswer: 'System optimization improves performance',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'f5_2',
        text: 'Build a sentence using: data / analysis / insights / valuable',
        expectedAnswer: 'Data analysis provides valuable insights',
        timeLimit: 15,
        difficulty: 'medium'
      },
      {
        id: 'f5_3',
        text: 'Build a sentence using: algorithm / efficiency / computational / enhances',
        expectedAnswer: 'The algorithm enhances computational efficiency',
        timeLimit: 20,
        difficulty: 'hard'
      }
    ]
  }
]

// Section G: Free Speech Topics
export const SECTION_G_QUESTIONS: QuestionSet[] = [
  {
    id: 'set_g_1',
    name: 'Personal Development',
    description: 'Topics about personal growth and development',
    questions: [
      {
        id: 'g1_1',
        text: 'The importance of continuous learning in personal and professional development',
        expectedAnswer: 'learning benefits, skill development, career growth, adaptation',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g1_2',
        text: 'How to maintain work-life balance in modern society',
        expectedAnswer: 'balance strategies, time management, priorities, well-being',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g1_3',
        text: 'The role of goal setting in achieving success',
        expectedAnswer: 'goal importance, planning, motivation, achievement',
        timeLimit: 45,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_g_2',
    name: 'Technology & Society',
    description: 'Topics about technology and its impact',
    questions: [
      {
        id: 'g2_1',
        text: 'The impact of social media on modern communication',
        expectedAnswer: 'communication changes, social effects, benefits, challenges',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g2_2',
        text: 'How technology has changed the way we work',
        expectedAnswer: 'workplace transformation, remote work, efficiency, challenges',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g2_3',
        text: 'The importance of digital literacy in the 21st century',
        expectedAnswer: 'digital skills, technology adaptation, education, future readiness',
        timeLimit: 45,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_g_3',
    name: 'Education & Learning',
    description: 'Topics about education and learning processes',
    questions: [
      {
        id: 'g3_1',
        text: 'The benefits of studying abroad for personal growth',
        expectedAnswer: 'cultural exposure, independence, language skills, global perspective',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g3_2',
        text: 'The importance of practical experience alongside theoretical knowledge',
        expectedAnswer: 'hands-on learning, application, skill development, career preparation',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g3_3',
        text: 'How online learning has transformed education',
        expectedAnswer: 'digital education, accessibility, flexibility, challenges',
        timeLimit: 45,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_g_4',
    name: 'Environment & Sustainability',
    description: 'Topics about environmental issues and sustainability',
    questions: [
      {
        id: 'g4_1',
        text: 'The importance of environmental conservation for future generations',
        expectedAnswer: 'environmental protection, sustainability, future impact, responsibility',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g4_2',
        text: 'How individuals can contribute to reducing climate change',
        expectedAnswer: 'personal actions, lifestyle changes, environmental responsibility, impact',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g4_3',
        text: 'The role of renewable energy in sustainable development',
        expectedAnswer: 'clean energy, sustainability, environmental benefits, future energy',
        timeLimit: 45,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'set_g_5',
    name: 'Health & Lifestyle',
    description: 'Topics about health, fitness, and lifestyle',
    questions: [
      {
        id: 'g5_1',
        text: 'The importance of regular exercise for physical and mental health',
        expectedAnswer: 'exercise benefits, physical health, mental well-being, lifestyle',
        timeLimit: 45,
        difficulty: 'easy'
      },
      {
        id: 'g5_2',
        text: 'How stress affects our daily lives and ways to manage it',
        expectedAnswer: 'stress impact, management techniques, coping strategies, well-being',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g5_3',
        text: 'The role of nutrition in maintaining good health',
        expectedAnswer: 'healthy eating, nutrition importance, diet impact, wellness',
        timeLimit: 45,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_g_6',
    name: 'Career & Professional Life',
    description: 'Topics about career development and professional growth',
    questions: [
      {
        id: 'g6_1',
        text: 'The importance of networking in career development',
        expectedAnswer: 'professional relationships, career opportunities, skill sharing, growth',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g6_2',
        text: 'How to develop leadership skills in the workplace',
        expectedAnswer: 'leadership development, management skills, team building, professional growth',
        timeLimit: 45,
        difficulty: 'hard'
      },
      {
        id: 'g6_3',
        text: 'The challenges and benefits of remote work',
        expectedAnswer: 'remote work advantages, challenges, productivity, work-life balance',
        timeLimit: 45,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'set_g_7',
    name: 'Culture & Society',
    description: 'Topics about cultural diversity and social issues',
    questions: [
      {
        id: 'g7_1',
        text: 'The benefits of cultural diversity in the workplace',
        expectedAnswer: 'diversity advantages, cultural perspectives, innovation, inclusion',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g7_2',
        text: 'How travel broadens our understanding of different cultures',
        expectedAnswer: 'cultural exposure, global perspective, understanding, personal growth',
        timeLimit: 45,
        difficulty: 'medium'
      },
      {
        id: 'g7_3',
        text: 'The importance of preserving traditional customs in modern society',
        expectedAnswer: 'cultural preservation, tradition value, modern balance, heritage',
        timeLimit: 45,
        difficulty: 'hard'
      }
    ]
  }
]

// Question selection utility functions
export function getRandomQuestionSet(sectionQuestions: QuestionSet[]): QuestionSet {
  const randomIndex = Math.floor(Math.random() * sectionQuestions.length)
  return sectionQuestions[randomIndex]
}

export function getQuestionSetById(sectionQuestions: QuestionSet[], setId: string): QuestionSet | null {
  return sectionQuestions.find(set => set.id === setId) || null
}

export function getAllQuestionSets() {
  return {
    A: SECTION_A_QUESTIONS,
    B: SECTION_B_QUESTIONS,
    C: SECTION_C_QUESTIONS,
    D: SECTION_D_QUESTIONS,
    E: SECTION_E_QUESTIONS,
    F: SECTION_F_QUESTIONS,
    G: SECTION_G_QUESTIONS
  }
}

export function getQuestionSetsByDifficulty(sectionQuestions: QuestionSet[], difficulty: 'easy' | 'medium' | 'hard'): QuestionSet[] {
  return sectionQuestions.filter(set => 
    set.questions.some(q => q.difficulty === difficulty)
  )
}

export function generateTestQuestions(previousTestIds: string[] = []): { [key: string]: QuestionSet } {
  const allSets = getAllQuestionSets()
  const selectedSets: { [key: string]: QuestionSet } = {}
  
  // For each section, select a random set that hasn't been used recently
  Object.keys(allSets).forEach(section => {
    const sectionSets = allSets[section as keyof typeof allSets]
    const availableSets = sectionSets.filter(set => !previousTestIds.includes(set.id))
    
    // If all sets have been used, reset and use any set
    const setsToChooseFrom = availableSets.length > 0 ? availableSets : sectionSets
    selectedSets[section] = getRandomQuestionSet(setsToChooseFrom)
  })
  
  return selectedSets
}