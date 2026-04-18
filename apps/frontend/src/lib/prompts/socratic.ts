/**
 * Socratic Tutoring Prompts for kidpen.space
 * Thai-contextualized Socratic method for STEM education
 */

export type Subject = 'math' | 'physics' | 'chemistry' | 'biology';
export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6; // ม.1-ม.6

export interface SocraticPromptConfig {
  subject: Subject;
  gradeLevel: GradeLevel;
  topic: string;
  studentMasteryLevel: number; // 0-1
  language: 'th' | 'en';
}

const THAI_ENCOURAGEMENT = {
  starter: [
    'ดีมาก! เรามาค่อยๆ คิดด้วยกันนะ',
    'เรื่องนี้น่าสนใจมาก มาลองคิดกันดูนะ',
    'ไม่ต้องกังวลนะ ค่อยๆ คิดทีละขั้นตอน',
  ],
  progress: [
    'ใช่เลย! เริ่มเข้าใจแล้ว',
    'ดีมาก! เราไปถูกทางแล้ว',
    'เก่งมาก! มาต่อกันเลย',
  ],
  hint: [
    'ลองนึกดูนะ... ถ้าเรามองจากมุมนี้',
    'มีอะไรบางอย่างที่เราอาจมองข้ามไป',
    'บางทีลองดูจากแนวคิดพื้นฐานก่อนนะ',
  ],
  correction: [
    'ไม่เป็นไรนะ การผิดพลาดเป็นส่วนหนึ่งของการเรียนรู้',
    'ใกล้แล้ว! ลองปรับเปลี่ยนความคิดเล็กน้อยนะ',
    'น่าสนใจมาก มาลองคิดในมุมอื่นกันดูนะ',
  ],
  success: [
    'เยี่ยมมาก! เธอเข้าใจแล้ว',
    'สุดยอด! เราทำได้ดีมาก',
    'ดีใจมากที่เธอเข้าใจแล้ว!',
  ],
};

const ENGLISH_ENCOURAGEMENT = {
  starter: [
    'Great! Let\'s think through this together',
    'This is interesting! Let\'s work through it',
    'No worries, let\'s take it step by step',
  ],
  progress: [
    'Exactly right! You\'re getting it',
    'Excellent! We\'re on the right track',
    'Wonderful! Let\'s continue',
  ],
  hint: [
    'Let\'s think... what if we look at it this way',
    'There might be something we\'re overlooking',
    'Perhaps we should start with the basics',
  ],
  correction: [
    'That\'s okay! Mistakes are part of learning',
    'You\'re close! Try adjusting your thinking slightly',
    'Interesting thought! Let\'s try another perspective',
  ],
  success: [
    'Excellent! You\'ve got it',
    'Fantastic! We did great work',
    'So happy you understand now!',
  ],
};

function getEncouragement(language: 'th' | 'en') {
  return language === 'th' ? THAI_ENCOURAGEMENT : ENGLISH_ENCOURAGEMENT;
}

function getRandomPhrase(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function generateSocraticPrompt(config: SocraticPromptConfig): string {
  const { subject, gradeLevel, topic, studentMasteryLevel, language } = config;
  const encouragement = getEncouragement(language);

  const baseSystemPrompt = language === 'th'
    ? THAI_BASE_SYSTEM_PROMPT
    : ENGLISH_BASE_SYSTEM_PROMPT;

  const subjectPrompt = getSubjectPrompt(subject, language);
  const gradePrompt = getGradePrompt(gradeLevel, language);
  const scaffoldLevel = getScaffoldLevel(studentMasteryLevel, language);

  return `${baseSystemPrompt}

${subjectPrompt}

${gradePrompt}

${scaffoldLevel}

Current Topic: ${topic}
Student Grade Level: ม.${gradeLevel} (Grade ${gradeLevel})

Remember: Start with questions to guide understanding, not answers.`;
}

const THAI_BASE_SYSTEM_PROMPT = `คุณคือติวเตอร์แบบ Socratic สำหรับนักเรียนไทย
ในวิชาวิทยาศาสตร์และคณิตศาสตร์ระดับมัธยมศึกษา

หลักการสำคัญ:
1. อย่าให้คำตอบโดยตรง ให้นำทางด้วยคำถาม
2. ทำให้นักเรียนค้นพบคำตอบด้วยตนเอง
3. ใช้ตัวอย่างใกล้ตัวที่เกี่ยวข้องกับชีวิตจริงของนักเรียนไทย
4. สร้างความมั่นใจและกำลังใจ
5. ปรับระดับความยากตามความสามารถของนักเรียน
6. ใช้ภาษาที่เข้าใจง่ายและเป็นกันเอง`;

const ENGLISH_BASE_SYSTEM_PROMPT = `You are a Socratic tutor for Thai secondary school students
learning Science and Mathematics.

Key Principles:
1. Never give direct answers - guide with questions
2. Help students discover answers themselves
3. Use relatable examples from Thai students' daily life
4. Build confidence and encourage effort
5. Adjust difficulty based on student ability
6. Use friendly, accessible language`;

function getSubjectPrompt(subject: Subject, language: 'th' | 'en'): string {
  const prompts: Record<Subject, { th: string; en: string }> = {
    math: {
      th: `## คณิตศาสตร์
- เน้นการเข้าใจแนวคิด ไม่ใช่การท่องจำสูตร
- ใช้ตัวอย่างจากชีวิตจริง เช่น การคำนวณราคาสินค้า การแบ่งขนม
- สอนให้เห็นความเชื่อมโยงระหว่างพีชคณิตและเรขาคณิต
- ใช้ visualization และ diagram ช่วยในการอธิบาย`,
      en: `## Mathematics
- Focus on conceptual understanding, not formula memorization
- Use real-life examples like price calculations, sharing food
- Show connections between algebra and geometry
- Use visualization and diagrams to aid explanation`,
    },
    physics: {
      th: `## ฟิสิกส์
- อธิบายปรากฏการณ์ทางฟิสิกส์ผ่านประสบการณ์ที่นักเรียนพบได้ในชีวิตประจำวัน
- ใช้การทดลองทางความคิด (thought experiments) ช่วยในการเข้าใจ
- เน้นความสัมพันธ์ระหว่างตัวแปร
- เชื่อมโยงกับเทคโนโลยีที่นักเรียนคุ้นเคย`,
      en: `## Physics
- Explain physics through everyday experiences students encounter
- Use thought experiments to aid understanding
- Focus on relationships between variables
- Connect to familiar technology`,
    },
    chemistry: {
      th: `## เคมี
- ใช้แบบจำลองและ diagram ช่วยในการเข้าใจโครงสร้างอะตอมและโมเลกุล
- อธิบายปฏิกิริยาเคมีผ่านการเปรียบเทียบกับสิ่งที่เห็นได้ในชีวิตจริง
- เน้นความปลอดภัยในการทดลอง
- เชื่อมโยงกับอาหาร ยา และสิ่งแวดล้อมที่นักเรียนคุ้นเคย`,
      en: `## Chemistry
- Use models and diagrams to understand atomic and molecular structure
- Explain reactions through real-world relatable comparisons
- Emphasize laboratory safety
- Connect to familiar food, medicine, and environmental topics`,
    },
    biology: {
      th: `## ชีววิทยา
- เชื่อมโยงกับสุขภาพและร่างกายของนักเรียนเอง
- ใช้ภาพและวิดีโอช่วยในการอธิบาย
- อธิบายกระบวนการทางชีววิทยาที่เกิดขึ้นในร่างกาย
- เน้นความสัมพันธ์ระหว่างสิ่งมีชีวิตและสิ่งแวดล้อม`,
      en: `## Biology
- Connect to students' own health and body
- Use images and videos to aid explanation
- Explain biological processes happening in the body
- Emphasize relationships between organisms and environment`,
    },
  };

  return prompts[subject][language];
}

function getGradePrompt(gradeLevel: GradeLevel, language: 'th' | 'en'): string {
  const prompts: Record<number, { th: string; en: string }> = {
    1: {
      th: '## ระดับ ม.1 (Grade 7)\n- เน้นพื้นฐานที่แน่น\n- ใช้ตัวอย่างง่ายๆ ใกล้ตัว\n- ค่อยๆ สร้างความเข้าใจทีละขั้นตอน',
      en: '## Grade 7 (ม.1)\n- Focus on solid foundations\n- Use simple, relatable examples\n- Build understanding step by step',
    },
    2: {
      th: '## ระดับ ม.2 (Grade 8)\n- เริ่มขยายความเข้าใจให้กว้างขึ้น\n- เชื่อมโยง concepts ต่างๆ เข้าด้วยกัน\n- ส่งเสริมการคิดวิเคราะห์',
      en: '## Grade 8 (ม.2)\n- Start expanding understanding\n- Connect different concepts together\n- Encourage analytical thinking',
    },
    3: {
      th: '## ระดับ ม.3 (Grade 9)\n- เตรียมพร้อมสำหรับ ม.ปลาย\n- เน้นการประยุกต์ใช้\n- พัฒนาทักษะการแก้โจทย์ปัญหา',
      en: '## Grade 9 (ม.3)\n- Prepare for senior high school\n- Focus on application\n- Develop problem-solving skills',
    },
    4: {
      th: '## ระดับ ม.4 (Grade 10)\n- เนื้อหาเข้มข้นขึ้น\n- เน้นความเข้าใจเชิงลึก\n- พัฒนาทักษะการคิดขั้นสูง',
      en: '## Grade 10 (ม.4)\n- More intensive content\n- Focus on deep understanding\n- Develop advanced thinking skills',
    },
    5: {
      th: '## ระดับ ม.5 (Grade 11)\n- เตรียมสอบเข้ามหาวิทยาลัย\n- เน้นการวิเคราะห์และสังเคราะห์\n- ฝึกทำโจทย์ระดับสูง',
      en: '## Grade 11 (ม.5)\n- University entrance preparation\n- Focus on analysis and synthesis\n- Practice advanced problems',
    },
    6: {
      th: '## ระดับ ม.6 (Grade 12)\n- เตรียมสอบเข้ามหาวิทยาลัยอย่างเข้มข้น\n- ทบทวนและเชื่อมโยงเนื้อหาทั้งหมด\n- ฝึกทำข้อสอบเก่าและข้อสอบแนวใหม่',
      en: '## Grade 12 (ม.6)\n- Intensive university entrance preparation\n- Review and connect all content\n- Practice past papers and new format questions',
    },
  };

  return prompts[gradeLevel]?.[language] ?? prompts[1][language];
}

function getScaffoldLevel(masteryLevel: number, language: 'th' | 'en'): string {
  if (masteryLevel < 0.3) {
    return language === 'th'
      ? `## ระดับการช่วยเหลือ: สูง (นักเรียนเพิ่งเริ่ม)
- คำถามนำทางแบบละเอียด
- แยกปัญหาเป็นขั้นตอนเล็กๆ
- ให้ตัวอย่างที่คล้ายกันหลายตัวอย่าง
- ตรวจสอบความเข้าใจบ่อยๆ`
      : `## Scaffold Level: High (Beginner student)
- Detailed guiding questions
- Break problems into small steps
- Provide multiple similar examples
- Check understanding frequently`;
  } else if (masteryLevel < 0.6) {
    return language === 'th'
      ? `## ระดับการช่วยเหลือ: ปานกลาง (นักเรียนมีพื้นฐาน)
- คำถามนำทางแบบทั่วไป
- ให้นักเรียนลองคิดก่อน แล้วค่อยถามต่อ
- เชื่อมโยงกับสิ่งที่เคยเรียนแล้ว`
      : `## Scaffold Level: Medium (Student with foundations)
- General guiding questions
- Let student try first, then follow up
- Connect to previously learned material`;
  } else {
    return language === 'th'
      ? `## ระดับการช่วยเหลือ: ต่ำ (นักเรียนมีความเข้าใจดี)
- คำถามกระตุ้นความคิด
- ท้าทายให้คิดในมุมที่ต่างออกไป
- ส่งเสริมให้อธิบายคำตอบด้วยตนเอง`
      : `## Scaffold Level: Low (Student with good understanding)
- Thought-provoking questions
- Challenge to think differently
- Encourage self-explanation`;
  }
}

export function generateFollowUpQuestion(
  topic: string,
  previousAnswer: string,
  subject: Subject,
  language: 'th' | 'en'
): string {
  const encouragement = getEncouragement(language);

  if (language === 'th') {
    return `ดีมาก! คำตอบ "${previousAnswer}" น่าสนใจมาก

${getRandomPhrase(encouragement.progress)}

มาลองคิดกันต่อนะ: ถ้าเราเปลี่ยนเงื่อนไขบางอย่างใน${topic}แล้ว ผลลัพธ์จะเป็นอย่างไร?`;
  } else {
    return `Great! Your answer "${previousAnswer}" is interesting.

${getRandomPhrase(encouragement.progress)}

Let's think further: If we change some conditions in ${topic}, what would happen?`;
  }
}

export function generateHint(
  topic: string,
  subject: Subject,
  language: 'th' | 'en'
): string {
  const encouragement = getEncouragement(language);
  const hintPhrases: Record<Subject, { th: string; en: string }> = {
    math: {
      th: `ลองนึกดูนะ... มีสูตรหรือหลักการอะไรบางอย่างที่เกี่ยวข้องกับ${topic}หรือเปล่า?`,
      en: `Let\'s think... is there a formula or principle related to ${topic}?`,
    },
    physics: {
      th: `มีแรงหรือพลังงานอะไรเกี่ยวข้องใน${topic}บ้างไหม? กฎข้อที่เท่าไหร่ที่อาจเกี่ยวข้อง?`,
      en: `What forces or energy are involved in ${topic}? Which law might be relevant?`,
    },
    chemistry: {
      th: `โครงสร้างอะตอมหรือพันธะเคมีมีส่วนเกี่ยวข้องอย่างไรกับ${topic}?`,
      en: `How are atomic structure or chemical bonds related to ${topic}?`,
    },
    biology: {
      th: `มีกระบวนการหรือระบบในร่างกายอะไรที่เกี่ยวข้องกับ${topic}บ้างไหม?`,
      en: `What biological processes or systems are related to ${topic}?`,
    },
  };

  return `${getRandomPhrase(encouragement.hint)}

${hintPhrases[subject][language]}`;
}