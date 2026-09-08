import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { generateGroomingPreview } from '../services/aiGroomingService';
import { GenerationError, GenerationResult } from '../types';
import { Button } from '../components/Button';

interface GeneratingScreenProps {
  photo: string;
  styleId: string;
  onDone: (result: GenerationResult) => void;
  /** Called when the user gives up and wants to pick a different style/photo. */
  onError: () => void;
}

// Labels reflect what is actually happening at each stage of the real
// request — there is no fixed/fake timer behind any of them.
const STAGE_LABELS: Record<string, string> = {
  analyzing: 'Przygotowujemy zdjęcie…',
  matching: 'Tworzymy wizualizację AI…',
  rendering: 'Finalizujemy…',
};

const STAGE_ORDER = ['analyzing', 'matching', 'rendering'];

export const GeneratingScreen: React.FC<GeneratingScreenProps> = ({
  photo,
  styleId,
  onDone,
  onError,
}) => {
  const [stage, setStage] = useState<string>('analyzing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const runningRef = useRef(false);

  const run = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setErrorMessage(null);
    setStage('analyzing');

    generateGroomingPreview(photo, styleId, (s) => setStage(s))
      .then((result) => {
        runningRef.current = false;
        onDone(result);
      })
      .catch((err: unknown) => {
        runningRef.current = false;
        const message =
          err instanceof GenerationError
            ? err.message
            : 'Coś poszło nie tak podczas generowania. Spróbuj ponownie.';
        setErrorMessage(message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, styleId, attempt]);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleRetry = () => {
    setAttempt((a) => a + 1);
  };

  if (errorMessage) {
    return (
      <div className="screen generating-screen generating-screen--error">
        <div className="generating-error">
          <div className="generating-error__icon">
            <FiAlertTriangle size={26} />
          </div>
          <h2>Generowanie się nie powiodło</h2>
          <p>{errorMessage}</p>
        </div>
        <div className="generating-error__actions">
          <Button variant="coral" onClick={handleRetry}>
            <FiRefreshCw size={15} /> Spróbuj ponownie
          </Button>
          <Button variant="ghost" onClick={onError}>
            Zmień styl
          </Button>
        </div>
      </div>
    );
  }

  const currentIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div className="screen generating-screen">
      <div className="generating-photo">
        <img src={photo} alt="Twój pies" />
        <div className="generating-photo__sweep" />
      </div>

      <div className="generating-status">
        <h2>{STAGE_LABELS[stage]}</h2>
        <div className="generating-progress">
          {STAGE_ORDER.map((s, i) => (
            <span
              key={s}
              className={`generating-progress__dot ${
                i === currentIndex
                  ? 'generating-progress__dot--active'
                  : i < currentIndex
                  ? 'generating-progress__dot--done'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
