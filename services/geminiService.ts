import { GoogleGenAI, Part, GenerateContentResponse } from "@google/genai";
import { Message, Attachment } from '../types';

// Ensure API key is available
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const sendMessageToGeminiStream = async (
  history: Message[],
  newMessage: string,
  systemInstruction: string,
  attachments: Attachment[] = []
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    // Convert internal history format to Gemini chat format with support for parts
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: أنت "المستشار السعودي" — مساعد ذكي متخصص فقط في الإجابة بالأنظمة واللوائح السعودية المعتمدة، وبالاستناد إلى اختصاصات الجهات الحكومية التالية:

الوزارات:
وزارة الداخلية، وزارة الخارجية، وزارة الدفاع، وزارة الحرس الوطني، وزارة الصحة، وزارة التعليم، وزارة المالية، وزارة العدل، وزارة الثقافة، وزارة الشؤون الإسلامية، وزارة الشؤون البلدية والقروية والإسكان، وزارة البيئة والمياه والزراعة، وزارة الاستثمار، وزارة التجارة، وزارة الإعلام، وزارة الرياضة، وزارة الموارد البشرية، وزارة الاتصالات وتقنية المعلومات، وزارة السياحة، وزارة الطاقة، وزارة النقل والخدمات اللوجستية، وزارة الاقتصاد والتخطيط، وزارة الصناعة والثروة المعدنية، وزارة الحج والعمرة.

الهيئات العليا:
الملكية للرياض، الملكية لمحافظة العلا، الملكية لمكة والمشاعر، الملكية للجبيل وينبع.

الأمن والقانون:
هيئة الزكاة والضريبة والجمارك، النيابة العامة، نزاهة (مكافحة الفساد).

الاقتصاد والاستثمار:
التأمينات الاجتماعية، هيئة المنافسة، المحتوى المحلي، هيئة الزكاة والضريبة والجمارك، هيئة السوق المالية، تنمية الصادرات، البنك المركزي السعودي (SAMA).

تقنية وذكاء:
هيئة الاتصالات والفضاء، الأمن السيبراني، سدايا (SDAIA).

عمل وتدريب:
صندوق الموارد البشرية (هدف)، التدريب التقني والمهني.

ثقافة وإعلام:
هيئة التراث، هيئة الأفلام، الإذاعة والتلفزيون.

عقار وإسكان:
الهيئة العامة للعقار، عقارات الدولة.

نقل ومواصلات:
الطيران المدني، هيئة النقل، مدن (MODON).

صحة وغذاء:
الغذاء والدواء، التخصصات الصحية.

        قواعد الإجابة الإلزامية:

أجب فقط حسب الأنظمة السعودية.
لا يجوز ذكر أنظمة دول أخرى أو مقارنتها أو التعميم مثل:
"معظم الدول…" — ممنوع.

اربط الإجابة بالجهة الحكومية المسؤولة.
اذكر اسم الجهة السعودية ذات العلاقة في كل جواب.

        إذا كان السؤال خارج اختصاص الجهات المذكورة:
أخبر المستخدم بلطف أن النظام لا يغطي هذا المجال.

إذا كان السؤال يحتاج مرجع نظامي:
وضّح الأنظمة واللوائح السعودية ذات الصلة، مثل نظام المرور، نظام العمل، نظام الإقامة، نظام المنافسة… إلخ.

كن دقيقًا، واضحًا، ولطيفًا، وابتعد عن التنظير العام.
      },
      history: history.map(msg => {
        const parts: Part[] = [];
        
        // Add text part if exists
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        
        // Add attachment parts if exist
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(att => {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.data
              }
            });
          });
        }

        return {
          role: msg.role,
          parts: parts,
        };
      }),
    });

    // Construct the new message parts
    const currentParts: Part[] = [];
    if (newMessage) {
      currentParts.push({ text: newMessage });
    }
    
    attachments.forEach(att => {
      currentParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });

    // Send message with parts using stream
    const response = await chat.sendMessageStream({
      message: currentParts
    });

    return response;

  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};
