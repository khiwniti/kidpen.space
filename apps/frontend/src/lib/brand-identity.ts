/**
 * Kidpen.space Brand Identity Configuration
 * 
 * "คิดเป็น" (Kidpen) - Thai STEM Socratic Tutoring Platform
 * 
 * Design Philosophy: "The Spark of Joy" 💡
 * - Learning should feel like a tiny party (Khan Academy)
 * - Balance of art, UI, and motion for playful feel (Brilliant × ustwo)
 * - Pointy shapes are off-brand (Duolingo)
 * - Soft brutalism with empathy (2026 Design Trends)
 * 
 * Core Principles:
 * 1. LIGHT & WARM — cream backgrounds, not cold whites
 * 2. ROUNDED EVERYTHING — no sharp corners, ever (gummy feel)
 * 3. SUBJECT COLORS — each subject has its own color world
 * 4. CELEBRATE PROGRESS — delight in every correct answer
 * 5. THAI-NATIVE — designed in Thai from day one
 */

// ═══════════════════════════════════════════════════════════════
// BRAND IDENTITY
// ═══════════════════════════════════════════════════════════════

export const brandIdentity = {
  // Core naming
  name: 'Kidpen',
  nameThai: 'คิดเป็น',
  tagline: 'แพลตฟอร์มการเรียนรู้โสคราติสสำหรับเด็กไทย',
  taglineEn: 'Socratic Tutoring Platform for Thai Students',
  domain: 'kidpen.space',
  
  // Mission & Vision
  mission: {
    th: 'สร้างประสบการณ์การเรียนรู้แบบโสคราติส (Socratic Tutoring) ที่มอบความหมาย ความสนุก และความเข้าใจในเชิงลึก สำหรับนักเรียนไทยระดับมัธยมศึกษาตอนต้น-ปลาย (ม.1 - ม.6) ภายใต้มาตรฐาน สสวท. (IPST)',
    en: 'Create meaningful, engaging Socratic tutoring experiences that build deep understanding for Thai secondary students (Grades 7-12) aligned with IPST standards.',
  },
  vision: {
    th: 'การศึกษา STEM ไม่ใช่การท่องจำ แต่คือการ "คิดเป็น" AI ไม่ใช่ผู้ให้คำตอบ แต่เป็นเพื่อนร่วมแก้ปัญหา ที่พร้อมจะช่วยใบ้และนำทางเมื่อนักเรียนติดขัด',
    en: 'STEM education is not memorization, but "thinking for yourself". AI is not an answer-giver, but a problem-solving companion ready to hint and guide when students get stuck.',
  },
  
  // Target audience
  audience: {
    primary: 'นักเรียนไทย ม.1 - ม.6 (อายุ 12-18 ปี)',
    primaryEn: 'Thai secondary students, Grades 7-12 (ages 12-18)',
    reach: '4.4M students nationwide',
    curriculum: 'IPST (สสวท.) standards',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// COLOR PALETTE (Subject Worlds)
// ═══════════════════════════════════════════════════════════════

export const brandColors = {
  // Primary brand color
  brand: {
    gold: '#F5A623',
    goldLight: '#FFF0D4',
    goldDark: '#C47A06',
    goldHover: '#E0941B',
  },
  
  // Background (warm, never cold white)
  background: {
    cream: '#FFFCF7',      // Primary background
    creamWarm: '#FFF8EF',   // Chat backgrounds, secondary areas
    creamDark: '#F5F0E8',   // Tertiary/muted backgrounds
    white: '#FFFFFF',       // Cards, elevated surfaces
    dark: '#1A1B2E',        // Dark mode primary
    darkCard: '#252740',    // Dark mode cards
  },
  
  // Text colors
  text: {
    primary: '#1A1B2E',
    secondary: '#5C5E7A',
    muted: '#9496AD',
    hint: '#B8BAC9',
    inverse: '#FFFFFF',
  },
  
  // Subject colors (each subject has its own world)
  subjects: {
    math: {
      name: 'คณิตศาสตร์',
      nameEn: 'Mathematics',
      icon: '📐',
      primary: '#2563EB',
      hover: '#1D4ED8',
      light: '#EEF4FF',
      dark: '#1E40AF',
    },
    science: {
      name: 'วิทยาศาสตร์ / เคมี',
      nameEn: 'Science / Chemistry',
      icon: '🧪',
      primary: '#10B981',
      hover: '#059669',
      light: '#ECFDF5',
      dark: '#047857',
    },
    coding: {
      name: 'วิทยาการคำนวณ',
      nameEn: 'Computer Science',
      icon: '💻',
      primary: '#8B5CF6',
      hover: '#7C3AED',
      light: '#F5F3FF',
      dark: '#6D28D9',
    },
    physics: {
      name: 'ฟิสิกส์',
      nameEn: 'Physics',
      icon: '⚡',
      primary: '#F97316',
      hover: '#EA580C',
      light: '#FFF7ED',
      dark: '#C2410C',
    },
    data: {
      name: 'วิเคราะห์ข้อมูล',
      nameEn: 'Data Science',
      icon: '📊',
      primary: '#14B8A6',
      hover: '#0D9488',
      light: '#F0FDFA',
      dark: '#0F766E',
    },
  },
  
  // Feedback colors
  feedback: {
    success: '#22C55E',
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    info: '#6366F1',
    infoBg: '#EEF2FF',
    infoBorder: '#C7D2FE',
    hint: '#8B5CF6',
    hintBg: '#F5F3FF',
    hintBorder: '#DDD6FE',
  },
  
  // Gamification
  gamification: {
    xpGold: '#FFB800',
    streakFlame: '#FF6B35',
    levelEmerald: '#10B981',
    leagueBlue: '#3B82F6',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════

export const brandTypography = {
  // Primary font families
  fonts: {
    // English & Numerals
    sans: {
      name: 'Outfit',
      designer: 'Onur Yazıcı',
      weights: [300, 400, 500, 600, 700, 800],
      usage: 'Headlines, UI elements, English text, numerals',
    },
    // Thai script
    thai: {
      name: 'IBM Plex Sans Thai',
      designer: 'IBM',
      weights: [300, 400, 500, 600, 700],
      usage: 'Thai text, body copy, UI elements in Thai',
    },
    // Code
    mono: {
      name: 'JetBrains Mono',
      usage: 'Code blocks, formulas, technical content',
    },
  },
  
  // Font stack CSS
  fontStack: {
    sans: "'Outfit', 'IBM Plex Sans Thai', system-ui, sans-serif",
    thai: "'IBM Plex Sans Thai', 'Outfit', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  
  // Scale
  scale: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// VOICE & TONE (Socratic Method)
// ═══════════════════════════════════════════════════════════════

export const brandVoice = {
  // Core principle: Never give direct answers
  principle: 'AI is a problem-solving companion, not an answer machine',
  principleTh: 'AI คือเพื่อนร่วมแก้ปัญหา ไม่ใช่เครื่องให้คำตอบ',
  
  // ✓ DO: Encourage & Scaffold
  doExamples: [
    {
      th: 'เก่งมากที่คิดสูตรนี้ออกมาได้! แล้วถ้าค่า x ติดลบล่ะ ผลลัพธ์จะเป็นยังไงต่อ? ลองคิดดูนะ',
      en: 'Great job figuring out this formula! What if x is negative? What would happen then? Give it a try!',
      context: 'When student gets partial answer correct',
    },
    {
      th: 'หนูลองอธิบายให้คิดเป็นฟังว่า คิดยังไงถึงได้คำตอบนี้มา? 🤔',
      en: 'Can you explain your thinking? How did you arrive at this answer?',
      context: 'Prompting metacognition',
    },
    {
      th: 'ใกล้มากแล้ว! ลองดูตรงหน่วยอีกทีนะ ว่าตรงกันไหม',
      en: "You're so close! Check the units again - do they match?",
      context: 'Giving a hint without revealing answer',
    },
  ],
  
  // ✗ DON'T: Give direct answers
  dontExamples: [
    {
      th: 'คำตอบของสมการนี้คือ x = 5 ครับ',
      en: 'The answer to this equation is x = 5.',
      why: 'Removes learning opportunity',
    },
    {
      th: 'ผิดครับ ทำใหม่',
      en: 'Wrong. Try again.',
      why: 'Discouraging without guidance',
    },
  ],
  
  // Tone characteristics
  characteristics: {
    encouraging: 'Always celebrate effort and progress',
    curious: 'Ask questions that spark thinking',
    patient: 'Never rush or dismiss struggle',
    playful: 'Use emoji, warmth, and personality',
    respectful: 'Use polite Thai particles (ครับ/ค่ะ/นะ)',
  },
  
  // Scaffold levels (pyBKT-driven)
  scaffoldLevels: {
    1: { name: 'Scaffolding', description: 'Heavy hints, step-by-step guidance' },
    2: { name: 'Guided', description: 'Moderate hints, leading questions' },
    3: { name: 'Independent', description: 'Minimal hints, verification focus' },
    4: { name: 'Challenge', description: 'Extension problems, deeper exploration' },
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS (Radii, Shadows, Transitions)
// ═══════════════════════════════════════════════════════════════

export const brandTokens = {
  // Border radius (always rounded, gummy feel)
  radius: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px - "gummy" default
    '3xl': '2rem',    // 32px
    pill: '9999px',   // Full rounded
  },
  
  // Shadows (soft, warm)
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0 4px 16px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.1)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
    button: '0 4px 0px rgba(0, 0, 0, 0.1)',
    buttonActive: '0 2px 0px rgba(0, 0, 0, 0.1)',
    glow: '0 0 24px rgba(245, 166, 35, 0.2)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// AVATAR / LOGO
// ═══════════════════════════════════════════════════════════════

export const brandAvatar = {
  // AI avatar configuration
  ai: {
    text: 'ก',  // First letter of "คิดเป็น"
    bgColor: '#F5A623',
    textColor: '#FFFFFF',
    size: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    },
  },
  
  // Student avatar
  student: {
    bgColor: '#2563EB',
    textColor: '#FFFFFF',
  },
  
  // Logo wordmark
  wordmark: {
    text: 'kidpen',
    accent: '.space',
    accentColor: '#F5A623',
  },
} as const;

// Export all
export const brand = {
  identity: brandIdentity,
  colors: brandColors,
  typography: brandTypography,
  voice: brandVoice,
  tokens: brandTokens,
  avatar: brandAvatar,
} as const;

export default brand;
