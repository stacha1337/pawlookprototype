import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { TopBar } from '../components/TopBar';
import { GroomerCard } from '../components/GroomerCard';
import { getGroomersForStyle } from '../mock/groomers';
import { getStyleById } from '../mock/styles';

interface GroomersScreenProps {
  styleId: string;
  onBack: () => void;
}

export const GroomersScreen: React.FC<GroomersScreenProps> = ({ styleId, onBack }) => {
  const style = getStyleById(styleId);
  const groomers = getGroomersForStyle(styleId);

  return (
    <div className="screen">
      <TopBar title="Groomerzy we Wrocławiu" onBack={onBack} />

      <div className="groomers-intro">
        <p>
          Salony poniżej wykonują styl <strong>{style?.name}</strong>, który wybrałeś/aś.
        </p>
      </div>

      <div className="demo-banner">
        <FiAlertCircle size={16} className="demo-banner__icon" />
        Wszystkie dane poniżej są przykładowe (DEMO) i nie przedstawiają prawdziwych
        salonów groomerskich. W wersji produkcyjnej pojawią się tu realni, zweryfikowani
        groomerzy.
      </div>

      <div className="groomers-list">
        {groomers.map((g) => (
          <GroomerCard key={g.id} groomer={g} matchedStyleName={style?.name ?? ''} />
        ))}
      </div>
    </div>
  );
};
