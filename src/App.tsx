import React, { useState } from 'react';
import { Screen, GenerationResult } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { UploadScreen } from './screens/UploadScreen';
import { StyleSelectScreen } from './screens/StyleSelectScreen';
import { GeneratingScreen } from './screens/GeneratingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { GroomersScreen } from './screens/GroomersScreen';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [photo, setPhoto] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  return (
    <div className="app-shell">
      {screen === 'home' && <HomeScreen onStart={() => setScreen('upload')} />}

      {screen === 'upload' && (
        <UploadScreen
          initialPhoto={photo}
          onBack={() => setScreen('home')}
          onPhotoReady={(p) => {
            setPhoto(p);
            setScreen('style-select');
          }}
        />
      )}

      {screen === 'style-select' && photo && (
        <StyleSelectScreen
          initialStyleId={styleId}
          onBack={() => setScreen('upload')}
          onStyleChosen={(id) => {
            setStyleId(id);
            setScreen('generating');
          }}
        />
      )}

      {screen === 'generating' && photo && styleId && (
        <GeneratingScreen
          photo={photo}
          styleId={styleId}
          onDone={(r) => {
            setResult(r);
            setScreen('result');
          }}
          onError={() => setScreen('style-select')}
        />
      )}

      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          onClose={() => setScreen('home')}
          onFindGroomer={() => setScreen('groomers')}
        />
      )}

      {screen === 'groomers' && styleId && (
        <GroomersScreen styleId={styleId} onBack={() => setScreen('result')} />
      )}
    </div>
  );
};
