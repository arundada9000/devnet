import { GoogleGenAI } from "@google/genai";

let ai: any;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

export const analyzeDisasterImage = async (imageUrl: string, disasterType: string) => {
  if (!ai || !imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const prompt = `
You are a highly advanced incident and civic reporting AI. Analyze the provided image, which was reported as a "${disasterType}".
Your task is to provide a structured JSON response with the following fields:
1. "severityScore": A number from 1 to 10 indicating the severity of the incident (1 = minor civic issue like garbage or traffic, 10 = catastrophic disaster).
2. "isFake": A boolean indicating if the image appears to be a fake, a prank, or completely unrelated to the reported incident type (e.g., a selfie, a meme, a completely unrelated stock photo).
3. "tags": An array of strings representing key elements found in the image (e.g., ["garbage", "traffic", "fire", "flood"]).
4. "summary": A brief 1-2 sentence description of what you observe in the image.

Output ONLY valid JSON. Do not include markdown formatting or extra text.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: contentType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = result.text;
    if (!text) return null;

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        return null;
    }

  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

export const parseSmsReport = async (text: string) => {
  if (!ai) return null;

  try {
    const prompt = `
You are an emergency dispatcher AI. A user sent an SMS report: "${text}".
The SMS may be in any language (e.g., Nepali, Bhojpuri, Maithili, English).
Translate the emergency description to English, but also retain the exact original text.
Extract the incident type and any mentioned location.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING", description: "Incident type (e.g., fire, flood, accident, landslide, garbage, traffic, other)" },
            description: { type: "STRING", description: "A clean, concise description of the emergency translated to English" },
            locationName: { type: "STRING", description: "The location or place mentioned in the text (null if none)", nullable: true },
            rawDescription: { type: "STRING", description: "The exact, raw original SMS text sent by the user in its native language" }
          },
          required: ["type", "description", "rawDescription"]
        }
      }
    });

    const output = result.text;
    if (!output) return null;

    return JSON.parse(output);

  } catch (error) {
    console.error("AI SMS parse failed:", error);
    return null;
  }
};
