import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client using the recommended full-stack pattern
// with correct 'aistudio-build' User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI Recommendation Endpoint
app.post("/api/recommend", async (req, res) => {
  try {
    const { connectedServices, favorites, genres, promptOverride } = req.body;

    if (!connectedServices || connectedServices.length === 0) {
      return res.json({
        recommendations: [],
        message: "No connected streaming services found. Please connect some services to receive tailored recommendations.",
      });
    }

    const servicesList = connectedServices.join(", ");
    const favoriteTitles = favorites && favorites.length > 0
      ? favorites.map((f: any) => `${f.title} (${f.type})`).join(", ")
      : "None yet";
    const preferredGenres = genres && genres.length > 0 ? genres.join(", ") : "Any";

    const systemPrompt = `You are OmniStream's personalized entertainment AI recommendation engine.
Your task is to recommend exactly 6 movies or TV shows available on the user's active streaming subscriptions: ${servicesList}.
Do NOT suggest movies or shows from other platforms.

Use the following user preferences to tailor your recommendation:
- Preferred services: ${servicesList}
- User's favorite titles (for vibe match): ${favoriteTitles}
- Preferred genres: ${preferredGenres}
${promptOverride ? `- Additional user instruction: ${promptOverride}` : ""}

Return a realistic list of high-quality titles. Since these are recommendations, ensure they match the style and content catalog of those actual networks (e.g. Shudder is horror, Crunchyroll is anime, Netflix/Prime/Hulu are general, Tubi/Freevee/YouTube are free ad-supported with classic or niche catalogs). Provide high-quality descriptions and details.
Use placeholder URLs or realistic image keywords from unsplash for backgrounds/posters (e.g., "https://images.unsplash.com/photo-..." with high resolution or clean search queries to look beautiful).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate my streaming recommendation list based on my connected services and preferences.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: "List of 6 recommended media items",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Must be 'movie' or 'show'" },
                  service: { type: Type.STRING, description: "Must be one of the user's active services" },
                  backdropUrl: { type: Type.STRING },
                  posterUrl: { type: Type.STRING },
                  rating: { type: Type.STRING, description: "Age rating e.g., PG-13, TV-MA, R, TV-14" },
                  duration: { type: Type.STRING, description: "Duration e.g., '2h 14m' or '45m per ep'" },
                  description: { type: Type.STRING, description: "A highly compelling 2-3 sentence teaser" },
                  genres: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  releaseYear: { type: Type.INTEGER },
                  ratingScore: { type: Type.NUMBER, description: "Score out of 10, e.g., 8.4" },
                },
                required: [
                  "id",
                  "title",
                  "type",
                  "service",
                  "backdropUrl",
                  "posterUrl",
                  "rating",
                  "duration",
                  "description",
                  "genres",
                  "releaseYear",
                  "ratingScore",
                ],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini recommendation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate recommendations" });
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
