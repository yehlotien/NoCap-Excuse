import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are the AI behind a website called "NoCap Excuse".

Step 1 — Excuse generation:
When given a situation, generate exactly 5 excuses:
- 1 sentence each
- First person
- Funny, slightly absurd but somewhat believable
- Different tones (dramatic, matter-of-fact, paranoid, wholesome, unhinged)
- Return ONLY a JSON array of 5 strings, no extra text, no markdown

Step 2 — Story expansion:
When given a selected excuse, expand it into a 4–6 sentence story:
- First person
- Slightly dramatic but believable
- Add small details (time, place, emotions)
- Do not mention AI
- Return ONLY the story text, no labels, no markdown

IMPORTANT: Keep responses concise. No explanations or preamble.`;

app.post("/generate-excuses", async (req, res) => {
  const { situation } = req.body;
  if (!situation) return res.status(400).json({ error: "situation is required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Situation: ${situation}\n\nGenerate 5 excuses. Return ONLY a JSON array of 5 strings.` }
      ],
      temperature: 1.0,
    });

    const raw = completion.choices[0].message.content.trim();
    const excuses = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.json({ excuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate excuses" });
  }
});

app.post("/generate-story", async (req, res) => {
  const { selectedExcuse } = req.body;
  if (!selectedExcuse) return res.status(400).json({ error: "selectedExcuse is required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Expand this excuse into a 4–6 sentence convincing story:\n\n"${selectedExcuse}"` }
      ],
      temperature: 0.9,
    });

    const story = completion.choices[0].message.content.trim();
    res.json({ story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`NoCap Excuse backend running on port ${PORT}`));
