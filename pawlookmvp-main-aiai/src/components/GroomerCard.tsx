import React from 'react';
import { FiStar, FiCheckCircle } from 'react-icons/fi';
import { Groomer } from '../types';

interface GroomerCardProps {
  groomer: Groomer;
  matchedStyleName: string;
}

export const GroomerCard: React.FC<GroomerCardProps> = ({ groomer, matchedStyleName }) => {
  return (
    <div className="groomer-card">
      <div className="groomer-card__top">
        <div>
          <h3 className="groomer-card__name">{groomer.name}</h3>
          <p className="groomer-card__meta">
            {groomer.district} · Wrocław · od {groomer.priceFrom} zł
          </p>
        </div>
        <span className="groomer-card__price">{groomer.priceFrom} zł+</span>
      </div>

      <div className="groomer-card__rating">
        <FiStar size={14} />
        {groomer.rating.toFixed(1)} ({groomer.reviewCount} opinii)
      </div>

      <span className="groomer-card__match">
        <FiCheckCircle size={13} />
        Wykonuje styl {matchedStyleName}
      </span>

      <span className="groomer-card__demo-tag">DEMO — DANE PRZYKŁADOWE</span>
    </div>
  );
};
