import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to lazy initialize Google Gen AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

// Health Check API Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PM Tracking Smart Suite API' });
});

// AI Endpoint 1: Analyze Equipment Health & Risk
app.post('/api/ai/analyze-equipment', async (req, res) => {
  try {
    const { equipment } = req.body;
    if (!equipment) {
      return res.status(400).json({ error: 'Equipment data is required' });
    }

    const ai = getGeminiClient();
    const prompt = `You are a Senior Instrumentation & Logistics Maintenance Engineer.
Analyze the following equipment for predictive maintenance and ISO/GAMP calibration compliance:

Equipment Details:
- Name: ${equipment.name}
- Tag Code: ${equipment.code}
- Location Area & Line: ${equipment.area} / ${equipment.line}
- PM Type: ${equipment.pmType}
- Current Status: ${equipment.status}
- Last PM Date: ${equipment.lastPmDate}
- Next Due Date: ${equipment.nextDueDate}
- Work Order / PTW: ${equipment.workOrder || 'N/A'} / ${equipment.ptwNo || 'N/A'}
- Recent History Logs: ${JSON.stringify((equipment.history || []).slice(0, 3))}

Respond ONLY with valid JSON in this structure:
{
  "healthScore": 85,
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "healthSummary": "2 sentence expert assessment of the instrument",
  "recommendedActions": ["Action step 1", "Action step 2", "Action step 3"],
  "failureModeRisk": "Potential failure mode if PM is overdue or delayed",
  "isoCalibrationAdvice": "Calibration advice for ISO compliance"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (err: any) {
    console.error('AI Analyze Error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze equipment' });
  }
});

// AI Endpoint 2: Generate Executive Maintenance Summary
app.post('/api/ai/generate-summary', async (req, res) => {
  try {
    const { equipmentList } = req.body;
    if (!equipmentList || !Array.isArray(equipmentList)) {
      return res.status(400).json({ error: 'equipmentList array required' });
    }

    const ai = getGeminiClient();
    const total = equipmentList.length;
    const ok = equipmentList.filter((i: any) => i.status === 'OK').length;
    const dueSoon = equipmentList.filter((i: any) => i.status === 'Due Soon').length;
    const overdue = equipmentList.filter((i: any) => i.status === 'Overdue').length;

    const prompt = `You are the Instrumentation Logistics Department Head.
Generate a concise, professional executive maintenance report based on these live metrics:

- Total Tracked Equipment: ${total}
- Status OK: ${ok} (${total > 0 ? Math.round((ok / total) * 100) : 0}%)
- Due Soon: ${dueSoon} (${total > 0 ? Math.round((dueSoon / total) * 100) : 0}%)
- Overdue: ${overdue} (${total > 0 ? Math.round((overdue / total) * 100) : 0}%)

Provide 3 structured bullet points with key observations, critical risk mitigation recommendations, and resource deployment directives.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ summary: response.text || 'Summary unavailable' });
  } catch (err: any) {
    console.error('AI Summary Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate summary' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
