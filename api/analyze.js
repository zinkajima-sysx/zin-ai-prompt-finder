import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const { imageBase64, mediaType } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an advanced visual analyzer.
Analyze the uploaded media and describe:
- Subject
- Environment
- Lighting
- Camera angle
- Mood
- Motion (if video)
Be detailed.
`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this media." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    });

    const analysis = response.choices[0].message.content;

    const prompt = `
Ultra detailed cinematic scene based on analysis:
${analysis}

High resolution, dramatic lighting, realistic textures,
professional color grading, depth of field,
8K ultra quality, hyper realistic.
`;

    res.status(200).json({ analysis, prompt });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
