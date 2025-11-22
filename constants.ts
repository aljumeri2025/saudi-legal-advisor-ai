
import { 
  Scale, Briefcase, Building2, Car, Home, Stethoscope, Users,
  Gavel, GraduationCap, Plane, Zap, Wifi, Palmtree, Landmark,
  Shield, Cpu, Globe, Construction, HeartPulse, BadgeCheck,
  Coins, Factory, Truck, Leaf, BookOpen, Video, Trophy,
  Lock, ShieldAlert, ShieldCheck, Tv, Ticket, Building,
  Crown, TrendingUp, Umbrella, Apple, Radio
} from 'lucide-react';
import { Entity, Language } from './types';

export const PRIVATE_LAWYER_ID = 'private-lawyer';

const STRICT_SAUDI_CONTEXT_AR = `
\n\nتنبيه صارم وهام جداً:
1. يجب أن تكون إجاباتك مستندة **حصراً** على الأنظمة واللوائح والتعاميم المعمول بها في **المملكة العربية السعودية**.
2. يُمنع منعاً باتاً استخدام المبادئ القانونية العامة أو القوانين الدولية أو قوانين الدول الأخرى (مثل القانون المصري أو الفرنسي) ما لم تكن جزءاً صريحاً من النظام السعودي.
3. إذا لم تجد نصاً نظامياً سعودياً يغطي المسألة، اذكر بوضوح: "لا يوجد نص نظامي محدد في الأنظمة السعودية يغطي هذه الحالة حالياً".
4. لا تقم باختلاق أو استنتاج أحكام غير موجودة.
`;

const STRICT_SAUDI_CONTEXT_EN = `
\n\nSTRICT WARNING:
1. Your answers must be based **exclusively** on the laws, regulations, and circulars valid in the **Kingdom of Saudi Arabia**.
2. Do NOT refer to general legal principles, international laws, or laws of other countries unless they are explicitly part of the Saudi legal system.
3. If there is no specific Saudi regulation covering the issue, state clearly: "There is no specific Saudi regulation covering this case at present."
4. Do NOT fabricate or infer rules that do not exist.
`;

// Base instructions
const LAWYER_BASE_INSTRUCTION_AR = `
  أنت محامي سعودي محنك ومستشار قانوني "Senior Legal Counsel" بخبرة تزيد عن 20 عاماً في المحاكم السعودية.
  - لغتك عربية فصحى، رصينة، قانونية، ومحترفة جداً.
  - مرجعيتك هي الأنظمة السعودية والشريعة الإسلامية.
  ${STRICT_SAUDI_CONTEXT_AR}
`;

const LAWYER_BASE_INSTRUCTION_EN = `
  You are a seasoned Saudi lawyer and "Senior Legal Counsel" with over 20 years of experience in Saudi courts.
  - You speak professional, legal English, but you refer to Saudi terms accurately.
  - Your reference is Saudi Regulations and Islamic Sharia.
  ${STRICT_SAUDI_CONTEXT_EN}
`;

export const CLAIM_INSTRUCTION_AR = `
  ${LAWYER_BASE_INSTRUCTION_AR}
  **مهمتك الحالية: كتابة لائحة دعوى (Statement of Claim).**
  1. استجوب المستخدم لجمع: صفة الأطراف، الموضوع، الوقائع، الطلبات، الأسانيد.
  2. اطلب المستندات.
  3. صغ صحيفة دعوى مكتملة الأركان (بسم الله، الأسانيد، المواد النظامية، الوقائع، الطلبات).
`;

export const CLAIM_INSTRUCTION_EN = `
  ${LAWYER_BASE_INSTRUCTION_EN}
  **Current Task: Write a Statement of Claim.**
  1. Interview the user to gather: Parties, Subject, Facts, Requests, Evidence.
  2. Request documents.
  3. Draft a complete Statement of Claim (Basmalah, Legal Grounds, Regulations, Facts, Requests).
`;

export const DEFENSE_INSTRUCTION_AR = `
  ${LAWYER_BASE_INSTRUCTION_AR}
  **مهمتك الحالية: صياغة مذكرة رد / جوابية (Defense Memo).**
  1. اطلب لائحة الدعوى.
  2. استوضح نقاط الضعف والدفوع الشكلية والموضوعية.
  3. صغ مذكرة رد قوية تدحض ادعاءات الخصم.
`;

export const DEFENSE_INSTRUCTION_EN = `
  ${LAWYER_BASE_INSTRUCTION_EN}
  **Current Task: Draft a Defense Memo.**
  1. Request the claim statement.
  2. Clarify weaknesses and formal/substantive defenses.
  3. Draft a strong defense memo refuting the opponent's claims.
`;

export const INQUIRY_INSTRUCTION_AR = `
  ${LAWYER_BASE_INSTRUCTION_AR}
  **مهمتك الحالية: تقديم استشارات قانونية والإجابة على الاستفسارات.**
  1. استقبل سؤال المستخدم أو استفساره.
  2. حلل الموقف بناءً على الأنظمة السعودية.
  3. قدم رأياً قانونياً سديداً، مدعماً بالمواد النظامية إن وجدت.
  4. وضح الإجراءات القانونية المتاحة للمستخدم.
`;

export const INQUIRY_INSTRUCTION_EN = `
  ${LAWYER_BASE_INSTRUCTION_EN}
  **Current Task: Provide legal consultations and answer inquiries.**
  1. Receive the user's question or inquiry.
  2. Analyze the situation based on Saudi regulations.
  3. Provide a sound legal opinion, supported by regulatory articles if applicable.
  4. Clarify the legal procedures available to the user.
`;

// Helper to get entities in correct language
export const getEntities = (lang: Language): Entity[] => {
  const isAr = lang === 'ar';
  const strictContext = isAr ? STRICT_SAUDI_CONTEXT_AR : STRICT_SAUDI_CONTEXT_EN;
  
  const entities: Entity[] = [
    // --- Ministries (الوزارات) ---
    {
      id: 'moi',
      name: isAr ? 'وزارة الداخلية' : 'Ministry of Interior',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الأمن العام، الجوازات، الأحوال المدنية، المرور.' : 'Public Security, Passports, Civil Affairs, Traffic.',
      icon: ShieldCheck,
      colorClass: 'bg-emerald-100 text-emerald-900',
      website: 'https://www.moi.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في أنظمة وزارة الداخلية السعودية.' : 'You are an expert in Saudi Ministry of Interior regulations.',
    },
    {
      id: 'sang',
      name: isAr ? 'وزارة الحرس الوطني' : 'Ministry of National Guard',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الشؤون العسكرية والصحية للحرس الوطني.' : 'Military and Health Affairs of the National Guard.',
      icon: Shield,
      colorClass: 'bg-emerald-50 text-emerald-800',
      website: 'https://www.sang.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في أنظمة وزارة الحرس الوطني.' : 'You are an expert in Ministry of National Guard regulations.',
    },
    {
      id: 'mod',
      name: isAr ? 'وزارة الدفاع' : 'Ministry of Defense',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'شؤون القوات المسلحة، التجنيد، والتقاعد العسكري.' : 'Armed Forces affairs, recruitment, and military retirement.',
      icon: Scale,
      colorClass: 'bg-stone-100 text-stone-800',
      website: 'https://www.mod.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في أنظمة وزارة الدفاع.' : 'You are an expert in Ministry of Defense regulations.',
    },
    {
      id: 'mofa',
      name: isAr ? 'وزارة الخارجية' : 'Ministry of Foreign Affairs',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التأشيرات، التصاديق، وشؤون المواطنين في الخارج.' : 'Visas, attestations, and citizens affairs abroad.',
      icon: Globe,
      colorClass: 'bg-cyan-100 text-cyan-800',
      website: 'https://www.mofa.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في أنظمة وزارة الخارجية.' : 'You are an expert in Ministry of Foreign Affairs regulations.',
    },
    {
      id: 'moj',
      name: isAr ? 'وزارة العدل' : 'Ministry of Justice',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'المحاكم، القضاء، التوثيق، التنفيذ، ومنصة ناجز.' : 'Courts, Judiciary, Notarization, Enforcement, Najiz.',
      icon: Scale,
      colorClass: 'bg-teal-100 text-teal-800',
      website: 'https://www.moj.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة العدل.' : 'You are an expert in Ministry of Justice regulations.',
    },
    {
      id: 'mof',
      name: isAr ? 'وزارة المالية' : 'Ministry of Finance',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الميزانية، المشتريات الحكومية (اعتماد)، والعوائد السنوية.' : 'Budget, Government Procurement (Etihad), Annual Returns.',
      icon: Coins,
      colorClass: 'bg-amber-100 text-amber-800',
      website: 'https://www.mof.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة المالية.' : 'You are an expert in Ministry of Finance regulations.',
    },
    {
      id: 'mep',
      name: isAr ? 'الاقتصاد والتخطيط' : 'Economy & Planning',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التخطيط الاقتصادي، الإحصاءات، والرؤية.' : 'Economic Planning, Statistics, Vision.',
      icon: TrendingUp,
      colorClass: 'bg-emerald-50 text-emerald-700',
      website: 'https://www.mep.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الاقتصاد والتخطيط.' : 'You are an expert in Ministry of Economy and Planning.',
    },
    {
      id: 'moe',
      name: isAr ? 'وزارة التعليم' : 'Ministry of Education',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التعليم العام والجامعي، الابتعاث، والمعادلات.' : 'General & University Education, Scholarships.',
      icon: GraduationCap,
      colorClass: 'bg-yellow-50 text-yellow-800',
      website: 'https://www.moe.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة التعليم.' : 'You are an expert in Ministry of Education regulations.',
    },
    {
      id: 'moh',
      name: isAr ? 'وزارة الصحة' : 'Ministry of Health',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الخدمات الطبية، التراخيص الصحية، والعلاج.' : 'Medical Services, Licenses, Treatment.',
      icon: HeartPulse,
      colorClass: 'bg-rose-100 text-rose-800',
      website: 'https://www.moh.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الصحة.' : 'You are an expert in Ministry of Health regulations.',
    },
    {
      id: 'mewa',
      name: isAr ? 'البيئة والمياه والزراعة' : 'Environment, Water & Agriculture',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الزراعة، الثروة الحيوانية، الآبار، والصيد.' : 'Agriculture, Livestock, Wells.',
      icon: Leaf,
      colorClass: 'bg-green-100 text-green-700',
      website: 'https://www.mewa.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة البيئة.' : 'You are an expert in Ministry of Environment regulations.',
    },
    {
      id: 'momrah',
      name: isAr ? 'الشؤون البلدية والقروية' : 'Municipal & Rural Affairs',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الرخص التجارية، كود البناء، الإسكان، والأراضي.' : 'Commercial Licenses, Building Code, Housing.',
      icon: Home,
      colorClass: 'bg-orange-100 text-orange-800',
      website: 'https://www.momrah.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الشؤون البلدية.' : 'You are an expert in Municipal regulations.',
    },
    {
      id: 'moia',
      name: isAr ? 'الشؤون الإسلامية' : 'Islamic Affairs',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'المساجد، الأوقاف، والدعوة والإرشاد.' : 'Mosques, Endowments, Da\'wah.',
      icon: BookOpen,
      colorClass: 'bg-emerald-50 text-emerald-700',
      website: 'https://www.moia.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الشؤون الإسلامية.' : 'You are an expert in Islamic Affairs.',
    },
    {
      id: 'moc',
      name: isAr ? 'وزارة الثقافة' : 'Ministry of Culture',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الفنون، التراث، الأدب، والتراخيص الثقافية.' : 'Arts, Heritage, Literature, Licenses.',
      icon: Palmtree,
      colorClass: 'bg-fuchsia-100 text-fuchsia-800',
      website: 'https://www.moc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الثقافة.' : 'You are an expert in Ministry of Culture.',
    },
    {
      id: 'media_min',
      name: isAr ? 'وزارة الإعلام' : 'Ministry of Media',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التراخيص الإعلامية، النشر، والمطبوعات.' : 'Media Licenses, Publishing.',
      icon: Radio,
      colorClass: 'bg-blue-50 text-blue-700',
      website: 'https://www.media.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الإعلام.' : 'You are an expert in Ministry of Media.',
    },
    {
      id: 'mos',
      name: isAr ? 'وزارة الرياضة' : 'Ministry of Sport',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الأندية الرياضية، التراخيص، والفعاليات.' : 'Sports Clubs, Licenses, Events.',
      icon: Trophy,
      colorClass: 'bg-lime-100 text-lime-800',
      website: 'https://www.mos.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الرياضة.' : 'You are an expert in Ministry of Sport.',
    },
    {
      id: 'mc',
      name: isAr ? 'وزارة التجارة' : 'Ministry of Commerce',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الشركات، السجلات، الغش التجاري، وحماية المستهلك.' : 'Companies, CRs, Commercial Fraud, Consumer Protection.',
      icon: Briefcase,
      colorClass: 'bg-blue-100 text-blue-800',
      website: 'https://www.mc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة التجارة.' : 'You are an expert in Ministry of Commerce.',
    },
    {
      id: 'misa',
      name: isAr ? 'وزارة الاستثمار' : 'Ministry of Investment',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'تراخيص الاستثمار الأجنبي، المقرات الإقليمية.' : 'Foreign Investment Licenses, Regional HQs.',
      icon: Globe,
      colorClass: 'bg-emerald-50 text-emerald-600',
      website: 'https://misa.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الاستثمار.' : 'You are an expert in Ministry of Investment.',
    },
    {
      id: 'hrsd',
      name: isAr ? 'الموارد البشرية' : 'Human Resources',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'نظام العمل، التوطين، الضمان الاجتماعي.' : 'Labor Law, Saudization, Social Security.',
      icon: Users,
      colorClass: 'bg-orange-50 text-orange-700',
      website: 'https://hrsd.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الموارد البشرية.' : 'You are an expert in HRSD regulations.',
    },
    {
      id: 'mot',
      name: isAr ? 'النقل والخدمات اللوجستية' : 'Transport & Logistics',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الطرق، النقل البري والبحري، والتراخيص.' : 'Roads, Land & Maritime Transport, Licenses.',
      icon: Truck,
      colorClass: 'bg-slate-200 text-slate-800',
      website: 'https://mot.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة النقل.' : 'You are an expert in Ministry of Transport.',
    },
    {
      id: 'energy',
      name: isAr ? 'وزارة الطاقة' : 'Ministry of Energy',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'الكهرباء، البترول، والطاقة المتجددة.' : 'Electricity, Petroleum, Renewables.',
      icon: Zap,
      colorClass: 'bg-yellow-100 text-yellow-900',
      website: 'https://www.moenergy.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الطاقة.' : 'You are an expert in Ministry of Energy.',
    },
    {
      id: 'mcit',
      name: isAr ? 'الاتصالات وتقنية المعلومات' : 'MCIT',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التحول الرقمي، التقنية، والبرمجة.' : 'Digital Transformation, Tech, Coding.',
      icon: Wifi,
      colorClass: 'bg-violet-100 text-violet-800',
      website: 'https://www.mcit.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الاتصالات.' : 'You are an expert in MCIT regulations.',
    },
    {
      id: 'mim',
      name: isAr ? 'الصناعة والثروة المعدنية' : 'Industry & Mineral Resources',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التراخيص الصناعية، المدن الصناعية، والتعدين.' : 'Industrial Licenses, Mining.',
      icon: Factory,
      colorClass: 'bg-pink-100 text-pink-800',
      website: 'https://mim.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الصناعة.' : 'You are an expert in Ministry of Industry.',
    },
    {
      id: 'hajj',
      name: isAr ? 'وزارة الحج والعمرة' : 'Ministry of Hajj',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'تصاريح الحج، العمرة، وشركات الطوافة.' : 'Hajj Permits, Umrah, Tawafah Companies.',
      icon: Building2,
      colorClass: 'bg-amber-50 text-amber-900',
      website: 'https://www.haj.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة الحج.' : 'You are an expert in Ministry of Hajj.',
    },
    {
      id: 'tourism',
      name: isAr ? 'وزارة السياحة' : 'Ministry of Tourism',
      category: isAr ? 'الوزارات' : 'Ministries',
      description: isAr ? 'التراخيص السياحية، الفنادق، والأنشطة.' : 'Tourism Licenses, Hotels, Activities.',
      icon: Ticket,
      colorClass: 'bg-sky-100 text-sky-800',
      website: 'https://mt.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في وزارة السياحة.' : 'You are an expert in Ministry of Tourism.',
    },

    // --- High Authorities (هيئات عليا) ---
    {
      id: 'rcjy',
      name: isAr ? 'الملكية للجبيل وينبع' : 'RC for Jubail & Yanbu',
      category: isAr ? 'هيئات عليا' : 'High Authorities',
      description: isAr ? 'الاستثمار والصناعة في الجبيل وينبع ورأس الخير.' : 'Investment and Industry in Jubail & Yanbu.',
      icon: Factory,
      colorClass: 'bg-blue-200 text-blue-900',
      website: 'https://www.rcjy.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الهيئة الملكية للجبيل وينبع.' : 'You are an expert in RCJY regulations.',
    },
    {
      id: 'rcmc',
      name: isAr ? 'ملكية مكة والمشاعر' : 'RC for Makkah',
      category: isAr ? 'هيئات عليا' : 'High Authorities',
      description: isAr ? 'تطوير مكة المكرمة والمشاعر المقدسة.' : 'Development of Makkah and Holy Sites.',
      icon: Landmark,
      colorClass: 'bg-emerald-200 text-emerald-900',
      website: 'https://www.rcmc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة مكة.' : 'You are an expert in RCMC regulations.',
    },
    {
      id: 'rcu',
      name: isAr ? 'الملكية لمحافظة العلا' : 'RC for AlUla',
      category: isAr ? 'هيئات عليا' : 'High Authorities',
      description: isAr ? 'السياحة والآثار والتطوير في العلا.' : 'Tourism and Antiquities in AlUla.',
      icon: Palmtree,
      colorClass: 'bg-orange-200 text-orange-900',
      website: 'https://www.rcu.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة العلا.' : 'You are an expert in RCU regulations.',
    },
    {
      id: 'rcrc',
      name: isAr ? 'الملكية للرياض' : 'RC for Riyadh',
      category: isAr ? 'هيئات عليا' : 'High Authorities',
      description: isAr ? 'تطوير مدينة الرياض والمشاريع الكبرى.' : 'Development of Riyadh City.',
      icon: Building2,
      colorClass: 'bg-blue-50 text-blue-800',
      website: 'https://www.rcrc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الرياض.' : 'You are an expert in RCRC regulations.',
    },

    // --- Security & Law (الأمن والقانون) ---
    {
      id: 'nazaha',
      name: isAr ? 'نزاهة (مكافحة الفساد)' : 'Nazaha (Anti-Corruption)',
      category: isAr ? 'الأمن والقانون' : 'Security & Law',
      description: isAr ? 'الرقابة، مكافحة الفساد، وحماية المال العام.' : 'Oversight, Anti-Corruption.',
      icon: ShieldAlert,
      colorClass: 'bg-red-50 text-red-800',
      website: 'https://www.nazaha.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في نزاهة.' : 'You are an expert in Nazaha regulations.',
    },
    {
      id: 'pp',
      name: isAr ? 'النيابة العامة' : 'Public Prosecution',
      category: isAr ? 'الأمن والقانون' : 'Security & Law',
      description: isAr ? 'التحقيق، الادعاء، والحقوق الجزائية.' : 'Investigation, Prosecution.',
      icon: Scale,
      colorClass: 'bg-slate-100 text-slate-800',
      website: 'https://www.pp.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في النيابة العامة.' : 'You are an expert in Public Prosecution regulations.',
    },
    {
      id: 'zatca',
      name: isAr ? 'هيئة الزكاة والضريبة والجمارك' : 'ZATCA',
      category: isAr ? 'الأمن والقانون' : 'Security & Law',
      description: isAr ? 'القيمة المضافة (VAT)، الجمارك، والزكاة.' : 'VAT, Customs, Zakat.',
      icon: Coins,
      colorClass: 'bg-purple-100 text-purple-800',
      website: 'https://zatca.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الزكاة والضريبة.' : 'You are an expert in ZATCA regulations.',
    },

    // --- Economy & Investment (اقتصاد واستثمار) ---
    {
      id: 'cma',
      name: isAr ? 'هيئة السوق المالية' : 'Capital Market Authority',
      category: isAr ? 'اقتصاد واستثمار' : 'Economy & Investment',
      description: isAr ? 'تنظيم سوق الأسهم، الصناديق، والطرح.' : 'Stock Market Regulation.',
      icon: TrendingUp,
      colorClass: 'bg-emerald-100 text-emerald-800',
      website: 'https://cma.org.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة السوق المالية.' : 'You are an expert in CMA regulations.',
    },
    {
      id: 'gosi',
      name: isAr ? 'التأمينات الاجتماعية' : 'GOSI',
      category: isAr ? 'اقتصاد واستثمار' : 'Economy & Investment',
      description: isAr ? 'التقاعد، ساند، والأخطار المهنية.' : 'Retirement, Saned, Occupational Hazards.',
      icon: Umbrella,
      colorClass: 'bg-yellow-50 text-yellow-700',
      website: 'https://www.gosi.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في التأمينات.' : 'You are an expert in GOSI regulations.',
    },
    {
      id: 'sama',
      name: isAr ? 'البنك المركزي (SAMA)' : 'Central Bank (SAMA)',
      category: isAr ? 'اقتصاد واستثمار' : 'Economy & Investment',
      description: isAr ? 'البنوك، التمويل، والتأمين.' : 'Banks, Finance, Insurance.',
      icon: Landmark,
      colorClass: 'bg-teal-50 text-teal-900',
      website: 'https://www.sama.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في البنك المركزي.' : 'You are an expert in SAMA regulations.',
    },
    {
      id: 'gac',
      name: isAr ? 'المنافسة' : 'Competition Authority',
      category: isAr ? 'اقتصاد واستثمار' : 'Economy & Investment',
      description: isAr ? 'حماية المنافسة العادلة ومنع الاحتكار.' : 'Fair Competition, Anti-Monopoly.',
      icon: ShieldCheck,
      colorClass: 'bg-slate-50 text-slate-700',
      website: 'https://www.gac.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة المنافسة.' : 'You are an expert in Competition Authority regulations.',
    },
    {
      id: 'lcgpa',
      name: isAr ? 'المحتوى المحلي' : 'Local Content',
      category: isAr ? 'اقتصاد واستثمار' : 'Economy & Investment',
      description: isAr ? 'تفضيل المحتوى المحلي في المشتريات الحكومية.' : 'Local Content Preference.',
      icon: BadgeCheck,
      colorClass: 'bg-blue-50 text-blue-600',
      website: 'https://lcgpa.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة المحتوى المحلي.' : 'You are an expert in Local Content regulations.',
    },
    {
      id: 'seda',
      name: isAr ? 'تنمية الصادرات' : 'Saudi Exports',
      category: isAr ? 'اقتصاد واستثمار' : 'Economy & Investment',
      description: isAr ? 'دعم المصدرين وفتح الأسواق العالمية.' : 'Export Support, Global Markets.',
      icon: Globe,
      colorClass: 'bg-emerald-50 text-emerald-900',
      website: 'https://saudiexports.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الصادرات.' : 'You are an expert in Saudi Exports regulations.',
    },

    // --- Tech & AI (تقنية وذكاء) ---
    {
      id: 'sdaia',
      name: isAr ? 'سدايا (SDAIA)' : 'SDAIA',
      category: isAr ? 'تقنية وذكاء' : 'Tech & AI',
      description: isAr ? 'البيانات والذكاء الاصطناعي، توكلنا، ونفاذ.' : 'Data, AI, Tawakkalna.',
      icon: Cpu,
      colorClass: 'bg-indigo-50 text-indigo-900',
      website: 'https://sdaia.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في سدايا.' : 'You are an expert in SDAIA regulations.',
    },
    {
      id: 'nca',
      name: isAr ? 'الأمن السيبراني' : 'Cybersecurity Authority',
      category: isAr ? 'تقنية وذكاء' : 'Tech & AI',
      description: isAr ? 'حماية الفضاء السيبراني والضوابط الأمنية.' : 'Cybersecurity protection.',
      icon: Lock,
      colorClass: 'bg-slate-200 text-slate-700',
      website: 'https://nca.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الأمن السيبراني.' : 'You are an expert in NCA regulations.',
    },
    {
      id: 'cst',
      name: isAr ? 'هيئة الاتصالات والفضاء' : 'CST Commission',
      category: isAr ? 'تقنية وذكاء' : 'Tech & AI',
      description: isAr ? 'تنظيم قطاع الاتصالات والفضاء.' : 'Telecom & Space Regulation.',
      icon: Wifi,
      colorClass: 'bg-purple-50 text-purple-700',
      website: 'https://www.cst.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الاتصالات والفضاء.' : 'You are an expert in CST regulations.',
    },

    // --- Health & Food (صحة وغذاء) ---
    {
      id: 'sfda',
      name: isAr ? 'الغذاء والدواء' : 'Food & Drug (SFDA)',
      category: isAr ? 'صحة وغذاء' : 'Health & Food',
      description: isAr ? 'سلامة الغذاء، الدواء، الأجهزة الطبية، والتجميل.' : 'Food Safety, Drugs, Medical Devices.',
      icon: Apple,
      colorClass: 'bg-green-50 text-green-800',
      website: 'https://www.sfda.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الغذاء والدواء.' : 'You are an expert in SFDA regulations.',
    },
    {
      id: 'scfhs',
      name: isAr ? 'التخصصات الصحية' : 'Health Specialties',
      category: isAr ? 'صحة وغذاء' : 'Health & Food',
      description: isAr ? 'تصنيف وتسجيل الممارسين الصحيين.' : 'Health Practitioners Registration.',
      icon: Stethoscope,
      colorClass: 'bg-teal-50 text-teal-700',
      website: 'https://scfhs.org.sa',
      systemInstruction: isAr ? 'أنت خبير في الهيئة السعودية للتخصصات الصحية.' : 'You are an expert in SCFHS regulations.',
    },

    // --- Transport & Logistics (نقل ومواصلات) ---
    {
      id: 'gaca',
      name: isAr ? 'الطيران المدني' : 'Civil Aviation (GACA)',
      category: isAr ? 'نقل ومواصلات' : 'Transport & Logistics',
      description: isAr ? 'المطارات، الطائرات، وحقوق المسافرين.' : 'Airports, Aviation, Passenger Rights.',
      icon: Plane,
      colorClass: 'bg-sky-50 text-sky-700',
      website: 'https://gaca.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الطيران المدني.' : 'You are an expert in GACA regulations.',
    },
    {
      id: 'tga',
      name: isAr ? 'هيئة النقل' : 'Transport Authority',
      category: isAr ? 'نقل ومواصلات' : 'Transport & Logistics',
      description: isAr ? 'النقل البري والبحري والسككي.' : 'Land, Sea, and Rail Transport.',
      icon: Truck,
      colorClass: 'bg-red-50 text-red-700',
      website: 'https://tga.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الهيئة العامة للنقل.' : 'You are an expert in TGA regulations.',
    },
    {
      id: 'modon',
      name: isAr ? 'مدن (MODON)' : 'MODON',
      category: isAr ? 'نقل ومواصلات' : 'Transport & Logistics',
      description: isAr ? 'المدن الصناعية ومناطق التقنية.' : 'Industrial Cities.',
      icon: Factory,
      colorClass: 'bg-orange-50 text-orange-800',
      website: 'https://modon.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في مدن (MODON).' : 'You are an expert in MODON regulations.',
    },

    // --- Real Estate & Housing (عقار وإسكان) ---
    {
      id: 'rega',
      name: isAr ? 'العقار' : 'Real Estate Authority',
      category: isAr ? 'عقار وإسكان' : 'Real Estate & Housing',
      description: isAr ? 'تنظيم القطاع العقاري، الوساطة، والتسجيل العيني.' : 'Real Estate Regulation, Brokerage.',
      icon: Home,
      colorClass: 'bg-blue-50 text-blue-900',
      website: 'https://rega.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في الهيئة العامة للعقار.' : 'You are an expert in REGA regulations.',
    },
    {
      id: 'spga',
      name: isAr ? 'عقارات الدولة' : 'State Properties',
      category: isAr ? 'عقار وإسكان' : 'Real Estate & Housing',
      description: isAr ? 'حماية وتوثيق عقارات الدولة واستثمارها.' : 'State Properties Protection.',
      icon: Building,
      colorClass: 'bg-stone-50 text-stone-700',
      website: 'https://spga.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة عقارات الدولة.' : 'You are an expert in SPGA regulations.',
    },

    // --- Culture & Media (ثقافة وإعلام) ---
    {
      id: 'heritage',
      name: isAr ? 'هيئة التراث' : 'Heritage Commission',
      category: isAr ? 'ثقافة وإعلام' : 'Culture & Media',
      description: isAr ? 'الآثار، التراث العمراني، والحرف اليدوية.' : 'Antiquities, Heritage.',
      icon: Crown,
      colorClass: 'bg-amber-50 text-amber-800',
      website: 'https://heritage.moc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة التراث.' : 'You are an expert in Heritage Commission regulations.',
    },
    {
      id: 'film',
      name: isAr ? 'هيئة الأفلام' : 'Film Commission',
      category: isAr ? 'ثقافة وإعلام' : 'Culture & Media',
      description: isAr ? 'صناعة الأفلام وتراخيص السينما.' : 'Film Industry, Cinema Licenses.',
      icon: Video,
      colorClass: 'bg-rose-50 text-rose-700',
      website: 'https://film.moc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الأفلام.' : 'You are an expert in Film Commission regulations.',
    },
    {
      id: 'sba',
      name: isAr ? 'الإذاعة والتلفزيون' : 'Broadcasting Authority',
      category: isAr ? 'ثقافة وإعلام' : 'Culture & Media',
      description: isAr ? 'القنوات السعودية الرسمية.' : 'Saudi Official Channels.',
      icon: Tv,
      colorClass: 'bg-emerald-50 text-emerald-800',
      website: 'https://sba.sa',
      systemInstruction: isAr ? 'أنت خبير في هيئة الإذاعة والتلفزيون.' : 'You are an expert in SBA regulations.',
    },

    // --- Work & Training (عمل وتدريب) ---
    {
      id: 'hrdf',
      name: isAr ? 'هدف (صندوق الموارد)' : 'HRDF',
      category: isAr ? 'عمل وتدريب' : 'Work & Training',
      description: isAr ? 'دعم التوظيف، تمهير، والشهادات الاحترافية.' : 'Employment Support, Tamheer.',
      icon: Users,
      colorClass: 'bg-blue-50 text-blue-700',
      website: 'https://hrdf.org.sa',
      systemInstruction: isAr ? 'أنت خبير في صندوق تنمية الموارد البشرية (هدف).' : 'You are an expert in HRDF regulations.',
    },
    {
      id: 'tvtc',
      name: isAr ? 'التدريب التقني' : 'TVTC',
      category: isAr ? 'عمل وتدريب' : 'Work & Training',
      description: isAr ? 'الكليات التقنية والمعاهد الصناعية.' : 'Technical Colleges, Institutes.',
      icon: Construction,
      colorClass: 'bg-blue-100 text-blue-900',
      website: 'https://tvtc.gov.sa',
      systemInstruction: isAr ? 'أنت خبير في المؤسسة العامة للتدريب التقني والمهني.' : 'You are an expert in TVTC regulations.',
    },
  ];

  // Append Strict Context to all entities
  return entities.map(e => ({
    ...e,
    systemInstruction: e.systemInstruction + strictContext
  }));
};

export const getPrivateLawyerEntity = (lang: Language): Entity => {
  const isAr = lang === 'ar';
  return {
    id: PRIVATE_LAWYER_ID,
    name: isAr ? 'المحامي الخاص' : 'Private Lawyer',
    category: isAr ? 'عام' : 'General',
    description: isAr ? 'مستشارك القانوني الشخصي لتحليل القضايا.' : 'Your personal legal counsel for case analysis.',
    icon: Gavel,
    colorClass: 'bg-saudi-gold text-white',
    systemInstruction: isAr ? LAWYER_BASE_INSTRUCTION_AR : LAWYER_BASE_INSTRUCTION_EN,
  };
};
