import React, { MouseEventHandler } from 'react';

interface CardPropTypes {
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  isSelected?: boolean;
  className?: string;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * Card for displaying data
 */
export default function Card(props: CardPropTypes) {
  return (
    <div
      onMouseEnter={props.onMouseEnter}
      className={`${props.className} card ${
        props.isSelected ? 'card-selected' : ''
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
