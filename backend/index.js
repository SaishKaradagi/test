
import express from "express";
import cors from "cors";
import { chatSession } from "./geminiHelp/genemini.js";
import dotenv from "dotenv";
import { analyzeResume } from "./geminiHelp/resumeAnalyzer.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cors());
app.use(express.json());


// db connection 
try {
  mongoose.connect(MONGO_URL);
  console.log("Connected to mongoDB");
} catch (error) {
  console.log(error);
}


app.get("/", (req, res) => {
  res.send("Hello")
});

// Roadmap Generation Route
app.use("/roadmap", async (req, res) => {
  try {
    console.log(req.query, " req.query");
    const { field, months } = req.query;
    if (!field || !months) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const inputPrompt = `Generate a structured JSON roadmap for becoming a ${field} in ${months} months.
The JSON response should follow exactly this structure (keeping these exact property names):
{
  "roadmapTitle": "Career Roadmap for ${field}",
  "overallTimeFrame": "${months} months",
  "sections": [
    {
      "sectionTitle": "Prerequisites",
      "time": "X months/weeks",
      "topics": ["topic1", "topic2", "topic3"]
    },
    {
      "sectionTitle": "Basic Level",
      "time": "X months/weeks",
      "topics": ["topic1", "topic2", "topic3"]
    },
    {
      "sectionTitle": "Intermediate Level",
      "time": "X months/weeks",
      "topics": ["topic1", "topic2", "topic3"]
    },
    {
      "sectionTitle": "Advanced Level",
      "time": "X months/weeks", 
      "topics": ["topic1", "topic2", "topic3"]
    }
  ]
}

The sum of the time periods across all sections should equal ${months} months.
Provide the response as clean JSON only, no extra text, markdown, or code blocks.`;

    const result = await chatSession.sendMessage(inputPrompt);
    let jsonText = result.response.text();

    if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```json|```/g, "").trim();
    }

    console.log("Raw response:", jsonText);

    try {
      const parsedData = JSON.parse(jsonText);
      console.log("Parsed data:", parsedData);

      if (
        !parsedData.roadmapTitle ||
        !parsedData.overallTimeFrame ||
        !Array.isArray(parsedData.sections)
      ) {
        throw new Error("Invalid response structure");
      }

      res.status(200).json(parsedData);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      res
        .status(500)
        .json({ error: "Error parsing AI response", rawResponse: jsonText });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Error in fetching data through AI" });
  }
});

// New route for resume analysis
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || !targetRole) {
      return res
        .status(400)
        .json({ error: "Resume text and target role are required" });
    }
    console.log("Analyzing resume for role:", targetRole);
    console.log("Resume text length:", resumeText.length);

    const analysis = await analyzeResume(resumeText, targetRole);
    res.json(analysis);
  } catch (error) {
    console.error("Resume analysis error:", error.message);
    res
      .status(500)
      .json({
        error: "Failed to analyze resume",
        message: error.message,
        details:
          process.env.Node_ENV == "development" ? error.stack : undefined,
      });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
