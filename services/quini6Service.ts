import { FetchQuini6Result } from '../types';

export const fetchQuini6Results = async (drawNumber: string): Promise<FetchQuini6Result> => {
  console.log(`Buscando resultados de Quini 6 para el sorteo #${drawNumber} a través de la API segura...`);

  const response = await fetch(`/api/quini6?drawNumber=${drawNumber}`);

  if (!response.ok) {
     try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error del servidor: ${response.statusText}`);
    } catch (e) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
  }

  const data: FetchQuini6Result = await response.json();
  return data;
};
