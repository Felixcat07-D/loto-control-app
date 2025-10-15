import { FetchLotoResult } from '../types';

export const fetchLotteryResults = async (drawNumber: string): Promise<FetchLotoResult> => {
  console.log(`Buscando resultados para el sorteo #${drawNumber} a través de la API segura...`);
  
  const response = await fetch(`/api/loto?drawNumber=${drawNumber}`);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error del servidor: ${response.statusText}`);
    } catch (e) {
      // Fallback if the response is not JSON
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
  }

  const data: FetchLotoResult = await response.json();
  return data;
};
