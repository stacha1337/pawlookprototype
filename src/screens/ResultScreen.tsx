import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiBookmark, FiCheck } from 'react-icons/fi';
import { Button } from '../components/Button';
import { GenerationResult } from '../types';
import { getStyleById } from '../mock/styles';
import { saveLook } from '../utils/storage';

interface ResultScreenProps {
  result: GenerationResult;
  onClose: () => void;
  onFindGroomer: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onClose,
  onFindGroomer,
}) => {
  const [saved, setSaved] = useState(false);
  const style = getStyleById(result.styleId);

  const handleSave = () => {
    saveLook({
      id: `${result.styleId}-${result.generatedAt}`,
      styleId: result.styleId,
      resultImage: result.resultImage,
      savedAt: result.generatedAt,
    });
    setSaved(true);
  };

  return (
    <div className="screen">
      <div className="result-hero">
        <img src={result.resultImage} alt={`Wizualizacja stylu ${style?.name}`} />
        <span className="result-hero__badge">Wizualizacja AI</span>
        <button className="result-hero__back" onClick={onClose} aria-label="Zamknij">
          <FiX size={18} />
        </button>
      </div>

      <div className="result-body">
        <h1 className="result-style-name">
          {style?.emoji} {style?.name}
        </h1>
        <p className="result-style-desc">{style?.description}</p>

        <div className="result-disclaimer">
          <FiAlertTriangle size={16} className="result-disclaimer__icon" />
          <p>
            Wizualizacja poglądowa — rzeczywisty efekt może się różnić w zależności od
            sierści psa i pracy groomera.
          </p>
        </div>

        <div className="result-actions">
          <Button variant="coral" onClick={onFindGroomer}>
            Znajdź groomera
          </Button>
          <Button variant="ghost" onClick={handleSave} disabled={saved}>
            {saved ? (
              <>
                <FiCheck size={16} /> Zapisano look
              </>
            ) : (
              <>
                <FiBookmark size={16} /> Zapisz look
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
