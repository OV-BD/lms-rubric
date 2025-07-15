
import { GoogleGenAI } from "@google/genai";
import type { EvaluationData } from '../types';
import { RUBRIC_CATEGORIES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createEvaluationText = (evaluation: EvaluationData): string => {
  let report = `EVALUATION REPORT\n`;
  report += `Platform: ${evaluation.platformEvaluated}\n`;
  report += `Reviewer: ${evaluation.reviewerName}\n`;
  report += `Date: ${evaluation.evaluationDate}\n`;
  report += `Overall Weighted Score: ${evaluation.overallScore.toFixed(2)} / 5.00\n\n`;
  report += `--- DETAILED BREAKDOWN ---\n\n`;

  RUBRIC_CATEGORIES.forEach(category => {
    const categoryScoreData = evaluation.scores[category.id];
    if (!categoryScoreData) return;

    const itemsWithScores = Object.values(categoryScoreData.items).filter(item => typeof item.score === 'number');
    const categoryAvgScore = itemsWithScores.length > 0
      ? itemsWithScores.reduce((sum, item) => sum + (item.score as number), 0) / itemsWithScores.length
      : 0;

    report += `CATEGORY: ${category.name} (Weight: ${category.weight * 100}%)\n`;
    report += `Average Score for Category: ${categoryAvgScore.toFixed(2)} / 5.00\n`;
    
    category.items.forEach(item => {
      const itemScoreData = categoryScoreData.items[item.id];
      if (itemScoreData) {
        report += `  - Item: ${item.description}\n`;
        report += `    - Score: ${itemScoreData.score || 'N/A'}\n`;
        report += `    - Comments: ${itemScoreData.comments || 'None'}\n`;
      }
    });
    report += `\n`;
  });

  return report;
};

export const generateEvaluationSummary = async (evaluation: EvaluationData): Promise<string> => {
  if (!process.env.API_KEY) {
      return "Error: API_KEY environment variable is not set. Please configure it to use the AI summary feature.";
  }
    
  const evaluationText = createEvaluationText(evaluation);
  const prompt = `
    Based on the following LMS evaluation report, act as an expert technology procurement consultant and write a concise, executive summary. 

    The summary should:
    1.  Start with a clear final recommendation (e.g., "Strongly Recommended", "Recommended with Reservations", "Not Recommended").
    2.  Highlight the platform's key strengths based on high scores and positive comments.
    3.  Identify the most significant weaknesses or areas of concern, referencing specific low-scoring categories.
    4.  Conclude with a final sentence summarizing the platform's suitability for an organization focused on the criteria in the rubric.
    5.  The tone should be professional, objective, and data-driven. Do not invent information not present in the report.
    6.  Use markdown for formatting (bolding, lists).

    EVALUATION REPORT:
    ---
    ${evaluationText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    if (error instanceof Error) {
        return `An error occurred while generating the summary: ${error.message}`;
    }
    return "An unknown error occurred while generating the summary.";
  }
};
