export interface BonusProps {
  id: number;
  name: string;
  description: string | null;
  dpValue: string | null;
  category: string;
  conditions: string | null;
}

export interface ChallengeProps {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: number | null;
}

export interface HighScoreProps {
  id: number;
  name: string;
  description: string | null;
  category: string;
}

export interface IconProps {
  id: number;
  category: string;
  key: string;
  name: string;
  icon_path: string;
  color_hex: string | null;
  description: string | null;
}

