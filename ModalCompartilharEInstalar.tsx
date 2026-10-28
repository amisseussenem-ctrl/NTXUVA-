import React from 'react';
import { ModalInstalarTelemovel, LINK_OFICIAL_APP } from './ModalInstalarTelemovel';

export { LINK_OFICIAL_APP };

interface ModalCompartilharEInstalarProps {
  aberto: boolean;
  onFechar: () => void;
  urlPersonalizada?: string;
}

export const ModalCompartilharEInstalar: React.FC<ModalCompartilharEInstalarProps> = ({
  aberto,
  onFechar,
}) => {
  return (
    <ModalInstalarTelemovel
      aberto={aberto}
      onFechar={onFechar}
    />
  );
};
