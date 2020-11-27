import React, { MouseEventHandler } from 'react';

interface CardPropTypes {
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  isSelected?: boolean;
  className?: string;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default function Card(props: CardPropTypes) {
  let background;
  if (props.isSelected) {
    background = 'bg-darker-gray hover:bg-darkest-gray';
  } else {
    background = 'bg-lighter-gray hover:bg-darker-gray';
  }

  return (
    <div
      onMouseEnter={props.onMouseEnter}
      className={`${props.className} cursor-pointer p-2 rounded-md ${background}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
