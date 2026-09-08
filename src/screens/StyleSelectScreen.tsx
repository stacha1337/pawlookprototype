import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { StyleCard } from '../components/StyleCard';
import { GROOMING_STYLES } from '../mock/styles';

interface StyleSelectScreenProps {
  onBack: () => void;
  onStyleChosen: (styleId: string) => void;
  initialStyleId: string | null;
}

export const StyleSelectScreen: React.FC<StyleSelectScreenProps> = ({
  onBack,
  onStyleChosen,
  initialStyleId,
}) => {
  const [selected, setSelected] = useState<string | null>(initialStyleId);

  return (
    <div className="screen">
      <TopBar title="Wybierz styl" onBack={onBack} />

      <div className="style-grid">
        {GROOMING_STYLES.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            selected={selected === style.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      <div className="style-select-footer">
        <Button
          variant="primary"
          disabled={!selected}
          onClick={() => selected && onStyleChosen(selected)}
        >
          Generuj wizualizację
        </Button>
      </div>
    </div>
  );
};
