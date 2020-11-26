import React, { MouseEventHandler } from 'react';

interface CardPropTypes {
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

export default function Card(props: CardPropTypes) {
  return (
    <div
      className="bg-lighter-gray my-2 hover:bg-darker-gray cursor-pointer p-2 rounded-md"
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
