import { HardwareMode } from '../../components/chassis/ModeSelector';

export interface GuideExample {
  titleEn: string;
  titleBn: string;
  expression?: string;
  mode: HardwareMode;
  explanationEn: string;
  explanationBn: string;
}

export interface GuideSection {
  id: string;
  titleEn: string;
  titleBn: string;
  badge: string;
  summaryEn: string;
  summaryBn: string;
  tipsEn: string[];
  tipsBn: string[];
  examples: GuideExample[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'GENERAL',
    titleEn: 'HARDWARE BASICS & CONTROLS',
    titleBn: 'হার্ডওয়্যার পরিচিতি ও কন্ট্রোল',
    badge: 'CHASSIS',
    summaryEn: 'Heavy-duty rugged field calculator engineered for reliable offline calculations, laboratory math, and field engineering.',
    summaryBn: 'অফলাইন হিসাব, ল্যাব গণিত এবং ফিল্ড ইঞ্জিনিয়ারিংয়ের জন্য তৈরি হেভি-ডিউটি রাফ-অ্যান্ড-টাফ ক্যালকুলেটর।',
    tipsEn: [
      'Tap top-bar ☼ backlight button to cycle SAGE green, AMBER gold, and NVG stealth red.',
      'Tap audio or haptics icons to toggle tactile switch clicks and physical vibration pulses.',
      'Tap [TAPE] to view perforated paper tape history with quick reuse actions.',
    ],
    tipsBn: [
      'ডিসপ্লে ব্যাকলাইট পরিবর্তন করতে উপরের ☼ বাটনে ট্যাপ করুন (SAGE সবুজ, AMBER সোনালি, NVG লাল)।',
      'মেকানিক্যাল ক্লিক সাউন্ড এবং ভাইব্রেশন পালস অন/অফ করতে টুলবার আইকন ব্যবহার করুন।',
      'হিসাবের রসিদ ও পূর্ববর্তী ইতিহাস দেখতে [TAPE] বাটনে চাপ দিন।',
    ],
    examples: [],
  },
  {
    id: 'CALC_SCI',
    titleEn: 'CALCULATOR & CLASSWIZ SUITE',
    titleBn: 'ক্যালকুলেটর ও ক্লাসউইজ সায়েন্টিফিক',
    badge: 'SCI',
    summaryEn: 'Full scientific engine with Casio fx-991EX ClassWiz features: S<=>D fraction cycling, FACT prime factorization, nCr/nPr, and physics constants.',
    summaryBn: 'ক্যাসিও fx-991EX ক্লাসউইজ ফিচার সমৃদ্ধ ইঞ্জিন: ভগ্নাংশ রূপান্তর (S<=>D), মৌলিক উৎপাদক (FACT), সমাবেশ ও বিন্যাস (nCr/nPr) এবং বৈজ্ঞানিক ধ্রুবক।',
    tipsEn: [
      'S<=>D toggles the result between standard decimal, improper fraction, and mixed fraction.',
      'FACT factors any positive integer up to 10^12 into prime powers (e.g., 60 = 2^2 × 3 × 5).',
      'CONST chip bar inserts universal constants: c (light), g (gravity), h (Planck), NA (Avogadro).',
      '0ms Speculative Engine shows live "ans ≈ ..." preview before you press equals.',
    ],
    tipsBn: [
      'S<=>D বাটনে চাপ দিয়ে দশমিক মানকে সাধারণ ভগ্নাংশ ও মিশ্র ভগ্নাংশে রূপান্তর করুন।',
      'FACT বাটনে চাপ দিয়ে যেকোনো ধনাত্মক পূর্ণসংখ্যাকে মৌলিক উৎপাদকের ঘাতে বিশ্লেষণ করুন (যেমন: ৬০ = ২^২ × ৩ × ৫)।',
      'CONST বার থেকে সরাসরি পদার্থবিজ্ঞান ও রসায়নের গুরুত্বপূর্ণ ধ্রুবক (c, g, h, NA, π, e) যুক্ত করুন।',
      'সমান চিহ্ন চাপার আগেই ডিসপ্লেতে রিয়েল-টাইম "ans ≈ ..." লাইভ প্রিভিউ দেখতে পাবেন।',
    ],
    examples: [
      {
        titleEn: 'Combinations (5 nCr 2)',
        titleBn: 'সমাবেশ নির্ণয় (৫ nCr ২)',
        expression: '5 nCr 2',
        mode: 'SCI',
        explanationEn: 'Select 2 items from 5 = 10 ways',
        explanationBn: '৫টি উপাদান থেকে ২টি বাছাই করার উপায় = ১০',
      },
      {
        titleEn: 'Permutations (6 nPr 2)',
        titleBn: 'বিন্যাস নির্ণয় (৬ nPr ২)',
        expression: '6 nPr 2',
        mode: 'SCI',
        explanationEn: 'Arrange 2 items out of 6 = 30 ways',
        explanationBn: '৬টি উপাদান থেকে ২টি সাজানোর উপায় = ৩০',
      },
      {
        titleEn: 'Physics Energy (c * 2)',
        titleBn: 'পদার্থবিজ্ঞান ধ্রুবক (c × ২)',
        expression: 'c * 2',
        mode: 'SCI',
        explanationEn: 'Light speed (299,792,458 m/s) multiplied by 2',
        explanationBn: 'আলোর বেগ (২৯৯,৭৯২,৪৫৮ মি/সে) এর দ্বিগুণ মান',
      },
      {
        titleEn: 'Fraction Math (3/4 + 1/2)',
        titleBn: 'ভগ্নাংশের যোগফল (৩/৪ + ১/২)',
        expression: '3/4 + 1/2',
        mode: 'CALC',
        explanationEn: 'Equals 1.25 -> Tap S<=>D for 5/4 or 1 1/4',
        explanationBn: 'ফলাফল ১.২৫ -> S<=>D চাপলে ৫/৪ বা ১ ১/৪ দেখাবে',
      },
    ],
  },
  {
    id: 'DEV',
    titleEn: 'DEV & CS FIELD TOOLKIT',
    titleBn: 'প্রোগ্রামার ও কম্পিউটার সায়েন্স টুলস',
    badge: 'DEV',
    summaryEn: 'Built for CSE students and embedded engineers: 64-bit multi-base conversions, interactive bit grid, IEEE-754 single-precision float analysis, and UTF-8 codec.',
    summaryBn: 'সিএসই শিক্ষার্থী ও সফটওয়্যার ইঞ্জিনিয়ারদের জন্য: ৬৪-বিট মাল্টি-বেস রূপান্তর, ইন্টারেক্টিভ বিট গ্রিড, IEEE-754 ফ্লোট বিশ্লেষণ এবং UTF-8 কোডেক।',
    tipsEn: [
      'Tap any bit in the Interactive Bit Grid to toggle it live and observe Hex/Dec/Bin synchronizing.',
      'Tap SIGNED (2s) to inspect 2s-complement signed integers for 8, 16, 32, or 64-bit words.',
      'Sub-decks: BASES (radix), ALU (logic ops + flags), FLOAT (IEEE-754), TEXT (ASCII/UTF-8), DISCRETE (GCD/LCM/primes).',
    ],
    tipsBn: [
      'ইন্টারেক্টিভ বিট গ্রিডের যেকোনো বিটে ট্যাপ করে সরাসরি ০/১ পরিবর্তন করুন এবং হেক্স/ডেসিমাল মান দেখুন।',
      'SIGNED (2s) এ চাপ দিয়ে ২-এর পরিপূরক (Two\'s Complement) সাইনড মান পরীক্ষা করুন।',
      'সাব-ডেকসমূহ: BASES (বেস রূপান্তর), ALU (লজিক ও ফ্ল্যাগ), FLOAT (ফ্লোট ডিকম্পোজিশন), TEXT (ইউনিকোড), DISCRETE (গসাগু/লসাগু)।',
    ],
    examples: [
      {
        titleEn: 'Inspect Byte 255 (0xFF)',
        titleBn: 'বাইট ২৫৫ (0xFF) পরীক্ষা',
        expression: '255',
        mode: 'DEV',
        explanationEn: 'Full 8-bit mask (0b11111111) in 32-bit register',
        explanationBn: '৩২-বিট রেজিস্টারে সম্পূর্ণ ৮-বিট মাস্ক (0b11111111)',
      },
    ],
  },
  {
    id: 'CURR',
    titleEn: '165+ OFFLINE CURRENCY ENGINE',
    titleBn: '১৬৫+ অফলাইন কারেন্সি কনভার্টার',
    badge: 'CURR',
    summaryEn: 'Dual-source normalized exchange rates with full 165+ currency offline database. Never loses cached rates without internet.',
    summaryBn: 'ডুয়াল-এপিআই মার্জ করা ১৬৫+ দেশের মুদ্রা তালিকা। ইন্টারনেট ছাড়াও সার্বক্ষণিক অফলাইনে কাজ করে।',
    tipsEn: [
      'Popular chips allow 1-tap switching between USD, EUR, BDT, SAR, AED, GBP, and INR.',
      'Use the ⇄ button between cards to instantly swap source and target currencies.',
      'Offline Rates Cache can be manually updated in Hardware Settings.',
    ],
    tipsBn: [
      'পপুলার চিপস দিয়ে এক ট্যাপে USD, EUR, BDT, SAR, AED, GBP এবং INR পরিবর্তন করুন।',
      'কার্ড দুটির মাঝের ⇄ বাটনে চাপ দিয়ে দ্রুত ইনভার্স অদলবদল করুন।',
      'সেটিংস স্ক্রিন থেকে সর্বশেষ লাইভ রেট সিঙ্ক করে অফলাইন ক্যাশে জমা রাখতে পারেন।',
    ],
    examples: [
      {
        titleEn: 'Convert USD to BDT',
        titleBn: 'ইউএস ডলার থেকে বাংলাদেশি টাকা',
        mode: 'CURR',
        explanationEn: 'Instant offline conversion at benchmark reference rate',
        explanationBn: 'রেফারেন্স রেটে তাৎক্ষণিক অফলাইন কারেন্সি হিসাব',
      },
    ],
  },
  {
    id: 'UNIT',
    titleEn: 'MULTI-CATEGORY UNIT CONVERTER',
    titleBn: 'মাল্টি-ক্যাটাগরি একক রূপান্তর',
    badge: 'UNIT',
    summaryEn: 'Comprehensive engineering units across Length, Mass, Temperature, Digital Data, Speed, and South Asian Land Units.',
    summaryBn: 'দৈর্ঘ্য, ভর, তাপমাত্রা, ডিজিটাল মেমোরি, গতি এবং ঐতিহ্যবাহী বাংলাদেশি জমি পরিমাপের একক (বিঘা, কাঠা, শতাংশ)।',
    tipsEn: [
      'Land Area supports 1 Bigha = 20 Katha = 33.05785 Decimal = 14,400 sq ft.',
      '1 Katha = 720 sq ft = 1.65289 Decimal; 100 Decimal = 1 Acre.',
      'Digital storage accurately converts bits, Bytes, KB, MB, GB, and TB.',
    ],
    tipsBn: [
      'ভূমি পরিমাপে ১ বিঘা = ২০ কাঠা ≈ ৩৩.০৫৭৮৫ ডেসিমাল/শতাংশ = ১৪,৪০০ বর্গফুট।',
      '১ কাঠা = ৭২০ বর্গফুট ≈ ১.৬৫২৮৯ ডেসিমাল; ১০০ শতাংশ = ১ একর।',
      'ডিজিটাল ডেটাতে বাইট, কিলোবাইট, মেগাবাইট এবং গিগাবাইট নিখুঁতভাবে রূপান্তর করুন।',
    ],
    examples: [
      {
        titleEn: '1 Bigha to Katha & Decimal',
        titleBn: '১ বিঘা থেকে কাঠা ও শতাংশ',
        mode: 'UNIT',
        explanationEn: 'Benchmark land unit in Bangladesh & South Asia',
        explanationBn: 'বাংলাদেশ ও দক্ষিণ এশিয়ার প্রমিত জমি পরিমাপ',
      },
    ],
  },
  {
    id: 'TOOLS',
    titleEn: 'SMART FINANCIAL & HEALTH TOOLS',
    titleBn: 'স্মার্ট ফিন্যান্সিয়াল ও হেলথ টুলকিট',
    badge: 'TOOLS',
    summaryEn: 'Everyday life calculations: Tip & Bill Splitting, Discount & Sales Tax, Loan EMI schedule, and Body Mass Index (BMI) meter.',
    summaryBn: 'দৈনন্দিন স্মার্ট টুলস: টিপ ও বিল ভাগ, ডিসকাউন্ট ও ভ্যাট, লোন ইএমআই কিস্তি এবং বিএমআই স্বাস্থ্য মিটার।',
    tipsEn: [
      'Tip & Split lets you enter tip percentage and party count to calculate total and per-person cost.',
      'Loan EMI uses standard monthly compounding formula with interest-to-principal breakdown.',
      'BMI Gauge classifies health into Underweight, Normal, Overweight, and Obese ranges.',
    ],
    tipsBn: [
      'টিপ ও বিল ভাগ টুলে মোট বিল, টিপ এবং কয়জন খাবেন তা দিয়ে মাথাপিছু খরচ বের করুন।',
      'লোন ইএমআই টুলে মূল ঋণ, সুদের হার ও মেয়াদের ভিত্তিতে মাসিক কিস্তি হিসাব করুন।',
      'বিএমআই গেজে উচ্চতা ও ওজন দিয়ে স্বাস্থ্য স্ট্যাটাস (স্বাভাবিক, কম ওজন, অতিরিক্ত ওজন) জানুন।',
    ],
    examples: [
      {
        titleEn: 'Explore Smart Tools',
        titleBn: 'স্মার্ট টুলকিট দেখুন',
        mode: 'TOOLS',
        explanationEn: 'Instant financial and health calculations',
        explanationBn: 'তাৎক্ষণিক আর্থিক ও স্বাস্থ্য ক্যালকুলেশন',
      },
    ],
  },
];
