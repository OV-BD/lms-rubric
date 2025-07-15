
export interface RubricItem {
  id: string;
  description: string;
}

export interface RubricCategory {
  id: string;
  name: string;
  weight: number;
  items: RubricItem[];
}

export interface ScoreItem {
  score: number | '';
  comments: string;
}

export interface Scores {
  [categoryId: string]: {
    items: {
      [itemId: string]: ScoreItem;
    };
  };
}

export interface EvaluationData {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  evaluationDate: string;
  platformEvaluated: string;
  scores: Scores;
  overallScore: number;
  timestamp: string;
}
