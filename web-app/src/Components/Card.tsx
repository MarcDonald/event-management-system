import React, { MouseEventHandler } from 'react';

interface CardPropTypes {
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  isSelected?: boolean;
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
      className={`my-2 cursor-pointer p-2 rounded-md ${background}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
