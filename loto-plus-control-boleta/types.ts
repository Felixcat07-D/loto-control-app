// Loto Plus Types
export interface LotteryNumbers {
  numbers: number[];
}

export interface LotteryResult {
  drawNumber: number;
  drawDate: string;
  tradicional: LotteryNumbers;
  match: LotteryNumbers;
  desquite: LotteryNumbers;
  saleOSale: LotteryNumbers;
  plus: number;
}

export enum LotoPlusGameMode {
  Tradicional = 'Tradicional',
  Match = 'Match',
  Desquite = 'Desquite',
  SaleOSale = 'Sale o Sale',
}

export interface FetchLotoResult {
  results: LotteryResult;
  sources: GroundingChunk[];
}


// Quini 6 Types
export interface Quini6Result {
    drawNumber: number;
    drawDate: string;
    tradicionalPrimer: LotteryNumbers;
    tradicionalSegundo: LotteryNumbers;
    revancha: LotteryNumbers;
    siempreSale: LotteryNumbers;
    premioExtra: LotteryNumbers;
}

export enum Quini6GameMode {
    TradicionalPrimer = 'Tradicional Primer Sorteo',
    TradicionalSegundo = 'La Segunda del Quini',
    Revancha = 'Revancha',
    SiempreSale = 'Siempre Sale',
    PremioExtra = 'Premio Extra',
}

export interface FetchQuini6Result {
  results: Quini6Result;
  sources: GroundingChunk[];
}


// Generic Grounding Types
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}