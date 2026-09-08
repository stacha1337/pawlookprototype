import React, { useRef, useState } from 'react';
import { FiCamera, FiRefreshCw } from 'react-icons/fi';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';

interface UploadScreenProps {
  onBack: () => void;
  onPhotoReady: (dataUrl: string) => void;
  initialPhoto: string | null;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onBack,
  onPhotoReady,
  initialPhoto,
}) => {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('To nie wygląda na plik ze zdjęciem. Wybierz JPG lub PNG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.onerror = () => setError('Nie udało się wczytać zdjęcia. Spróbuj ponownie.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="screen">
      <TopBar title="Zdjęcie psa" onBack={onBack} />

      {!photo ? (
        <div
          className="upload-dropzone"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <div className="upload-dropzone__icon">
            <FiCamera size={28} />
          </div>
          <h2>Dodaj zdjęcie swojego psa</h2>
          <p>Najlepiej wyraźne zdjęcie całej sylwetki, w dobrym świetle.</p>
          <Button variant="ghost">Wybierz zdjęcie</Button>
        </div>
      ) : (
        <div className="upload-preview">
          <img src={photo} alt="Podgląd zdjęcia psa" />
          <button
            className="upload-preview__retake"
            onClick={() => inputRef.current?.click()}
          >
            <FiRefreshCw size={13} />
            Zmień zdjęcie
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && (
        <p className="upload-hint" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {!error && (
        <p className="upload-hint">
          Zdjęcie zostaje tylko na Twoim urządzeniu — nie wymagamy logowania.
        </p>
      )}

      <div className="upload-actions">
        <Button variant="primary" disabled={!photo} onClick={() => photo && onPhotoReady(photo)}>
          Dalej: wybierz styl
        </Button>
      </div>
    </div>
  );
};
