import { GoogleGenAI } from "@google/genai";

let ai: any;
const getAI = () => {
  if (ai) return ai;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return ai;
  }
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
  return null;
};

export const analyzeDisasterImage = async (imageUrl: string, disasterType: string, imageBuffer?: Buffer, providedMimeType?: string) => {
  const currentAi = getAI();
  if (!currentAi || (!imageUrl && !imageBuffer)) return null;

  try {
    let base64Image: string;
    let contentType = providedMimeType || "image/jpeg";

    if (imageBuffer) {
      base64Image = imageBuffer.toString("base64");
    } else {
      const response = await fetch(imageUrl);
      contentType = response.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString("base64");
    }

const prompt = `
You are a highly advanced incident and civic reporting AI. Analyze the provided image, which was reported as a "${disasterType}".
Your task is to provide a structured JSON response with the following fields:
1. "severityScore": A number from 1 to 10 indicating the severity of the incident (1 = minor civic issue like garbage or traffic, 10 = catastrophic disaster).
2. "isFake": A boolean. Set to true if the image is a prank, a meme, or completely unrelated to the reported incident (e.g., a photo of a TV screen, a plain wall, a selfie, or random objects showing no signs of an emergency). Set to false if it depicts a real incident or scene related to the report.
3. "tags": An array of strings representing key elements found in the image.
4. "summary": A brief 1-2 sentence description of what you observe in the image.

Output ONLY valid JSON.
`;

    const result = await currentAi.models.generateContent({
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
        responseSchema: {
          type: "OBJECT",
          properties: {
            severityScore: { type: "INTEGER", description: "Severity from 1 to 10" },
            isFake: { type: "BOOLEAN", description: "True if image is completely unrelated, a prank, a TV, or a wall" },
            tags: { type: "ARRAY", items: { type: "STRING" } },
            summary: { type: "STRING" }
          },
          required: ["severityScore", "isFake", "tags", "summary"]
        }
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
        require("fs").writeFileSync("ai_error.log", "Parse error: " + e + "\nText: " + text);
        return null;
    }

  } catch (error) {
    console.error("AI Analysis failed:", error);
    require("fs").writeFileSync("ai_error.log", "AI error: " + (error as any).stack || error);
    return null;
  }
};

export const parseSmsReport = async (text: string) => {
  const currentAi = getAI();
  if (!currentAi) return null;

  try {
    const prompt = `
You are an emergency dispatcher AI. A user sent an SMS report: "${text}".
The SMS may be in any language (e.g., Nepali, Bhojpuri, Maithili, English).
Translate the emergency description to English, but also retain the exact original text.
Extract the incident type and any mentioned location.
`;

    const result = await currentAi.models.generateContent({
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

export const translateWebReport = async (text: string) => {
  const currentAi = getAI();
  if (!currentAi) return null;

  try {
    const prompt = `
You are an emergency dispatcher AI. A user submitted a web report with the following description: "${text}".
The text may be in any language (e.g., Nepali, Bhojpuri, Maithili, English, Hindi).
Translate the emergency description to English. 
Return a JSON object containing the translated description and the original text.
`;

    const result = await currentAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            description: { type: "STRING", description: "The clean, concise description of the emergency translated to English" },
            rawDescription: { type: "STRING", description: "The exact, raw original text sent by the user in its native language" }
          },
          required: ["description", "rawDescription"]
        }
      }
    });

    const output = result.text;
    if (!output) return null;

    return JSON.parse(output);

  } catch (error) {
    console.error("AI Web parse failed:", error);
    return null;
  }
};

