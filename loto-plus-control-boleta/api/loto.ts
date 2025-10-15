import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LotteryResult, GroundingChunk } from '../types';

// This function will be deployed as a Vercel Serverless Function
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Allow requests from the frontend origin
  response.setHeader('Access-Control-Allow-Origin', '*'); 
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { drawNumber } = request.query;

  if (typeof drawNumber !== 'string' || !/^\d+$/.test(drawNumber)) {
    return response.status(400).json({ message: 'El número de sorteo es inválido.' });
  }

  // IMPORTANT: Get the API key from environment variables on the server
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return response.status(500).json({ message: 'La clave de API no está configurada en el servidor.' });
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Desde la fuente oficial https://www.ruta1000.com.ar/, encuentra los resultados de la lotería para el sorteo "Loto Plus" número ${drawNumber}.
  Proporciona la fecha del sorteo y los resultados para las cuatro secciones: 'Tradicional', 'Match', 'Desquite' y 'Sale o Sale', junto con el número 'Plus'.
  Formatea toda la respuesta como un único objeto JSON crudo, SIN texto adicional, explicaciones o formato markdown.
  La estructura JSON DEBE ser:
  {
    "drawNumber": ${drawNumber},
    "drawDate": "YYYY-MM-DD",
    "tradicional": { "numbers": [n1, n2, n3, n4, n5, n6] },
    "match": { "numbers": [n1, n2, n3, n4, n5, n6] },
    "desquite": { "numbers": [n1, n2, n3, n4, n5, n6] },
    "saleOSale": { "numbers": [n1, n2, n3, n4, n5, n6] },
    "plus": number
  }
  Si no se encuentra el número de sorteo, devuelve un objeto JSON con una clave "error".`;

  try {
    const genAIResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0,
      },
    });

    const rawText = genAIResponse.text;
    if (!rawText) {
      return response.status(500).json({ message: "El modelo devolvió una respuesta vacía. Es posible que el sorteo no exista." });
    }
    
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        return response.status(500).json({ message: "El modelo devolvió un formato inesperado." });
    }
    const cleanedJson = rawText.substring(firstBrace, lastBrace + 1);
    const results: LotteryResult & { error?: string } = JSON.parse(cleanedJson);

    if (results.error) {
        return response.status(404).json({ message: results.error });
    }
    
    results.drawNumber = parseInt(drawNumber, 10);
    const sources = genAIResponse.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return response.status(200).json({ results, sources });

  } catch (error: unknown) {
    console.error("Serverless function error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor.';
    return response.status(500).json({ message: errorMessage });
  }
}
