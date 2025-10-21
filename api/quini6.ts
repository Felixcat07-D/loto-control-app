import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Quini6Result, GroundingChunk } from '../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', '*'); 
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { drawNumber } = request.query;

  if (typeof drawNumber !== 'string' || !/^\d+$/.test(drawNumber)) {
    return response.status(400).json({ message: 'El número de sorteo es inválido.' });
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return response.status(500).json({ message: 'La clave de API no está configurada en el servidor.' });
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Tu tarea es encontrar los resultados del sorteo de lotería "Quini 6" de Argentina número ${drawNumber}.
1.  **Fuente Principal (Oficial):** Busca los resultados directamente en el sitio oficial: https://www.loteriasantafe.gov.ar/index.php/resultados/quini-6
2.  **Fuente Secundaria (Verificación):** Realiza una búsqueda general en Google para encontrar los mismos resultados en otro sitio confiable (como un periódico nacional o un sitio de resultados de lotería reconocido).
3.  **Comparación:** Compara los resultados de ambas fuentes. Si hay discrepancias, prioriza la fuente oficial.
4.  **Formato de Salida:** Proporciona una única respuesta consolidada en formato de objeto JSON crudo, SIN texto adicional, explicaciones o formato markdown.

La estructura JSON DEBE ser:
{
  "drawNumber": ${drawNumber},
  "drawDate": "YYYY-MM-DD",
  "tradicionalPrimer": { "numbers": [n1, n2, n3, n4, n5, n6] },
  "tradicionalSegundo": { "numbers": [n1, n2, n3, n4, n5, n6] },
  "revancha": { "numbers": [n1, n2, n3, n4, n5, n6] },
  "siempreSale": { "numbers": [n1, n2, n3, n4, n5, n6] },
  "premioExtra": { "numbers": [n1, n2, ...] }
}
Si no se encuentra el número de sorteo en ninguna fuente confiable, devuelve un objeto JSON con una clave "error".`;

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
    const results: Quini6Result & { error?: string } = JSON.parse(cleanedJson);

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