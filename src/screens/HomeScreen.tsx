import React from 'react';
import { FiCamera, FiSliders, FiEye } from 'react-icons/fi';
import { Button } from '../components/Button';

interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <div className="screen">
      <div className="home-hero">
        <div className="home-hero__brand">
          <span className="home-hero__brand-mark">🐩</span>
          PawLook
        </div>
        <div className="home-hero__art">🐕</div>
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Wizualizacja groomingu AI</p>
          <h1>Zobacz swojego psa po groomingu, zanim go ostrzyżesz</h1>
          <Button variant="coral" onClick={onStart}>
            Pokaż mi nowy look
          </Button>
        </div>
      </div>

      <div className="home-body">
        <div className="home-steps">
          <div className="home-step">
            <div className="home-step__icon">
              <FiCamera size={17} />
            </div>
            <div className="home-step__text">
              <h3>Dodaj zdjęcie psa</h3>
              <p>Zrób zdjęcie albo wybierz je z galerii. Bez zakładania konta.</p>
            </div>
          </div>
          <div className="home-step">
            <div className="home-step__icon">
              <FiSliders size={17} />
            </div>
            <div className="home-step__text">
              <h3>Wybierz styl</h3>
              <p>Teddy, Puppy Cut, Fluffy i inne popularne fryzury groomerskie.</p>
            </div>
          </div>
          <div className="home-step">
            <div className="home-step__icon">
              <FiEye size={17} />
            </div>
            <div className="home-step__text">
              <h3>Zobacz efekt i znajdź groomera</h3>
              <p>Obejrzyj wizualizację i sprawdź, kto wykona taki styl.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
