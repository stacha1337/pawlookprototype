import React from 'react';
import { GroomingStyle } from '../types';

interface StyleCardProps {
  style: GroomingStyle;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({ style, selected, onSelect }) => {
  return (
    <button
      className={`style-card ${selected ? 'style-card--selected' : ''}`}
      onClick={() => onSelect(style.id)}
    >
      <div
        className="style-card__art"
        style={{
          background: `linear-gradient(135deg, ${style.gradientFrom}, ${style.gradientTo})`,
        }}
      >
        {style.emoji}
      </div>
      <div className="style-card__body">
        <h3>{style.name}</h3>
        <p>{style.description}</p>
      </div>
    </button>
  );
};
