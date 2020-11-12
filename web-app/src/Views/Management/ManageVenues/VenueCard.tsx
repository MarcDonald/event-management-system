import React, { MouseEventHandler } from 'react';

interface VenueCardPropTypes {
  name: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export default function VenueCard(props: VenueCardPropTypes) {
  return (
    <div
      className="bg-lighter-gray my-2 hover:bg-darker-gray cursor-pointer p-2 rounded-md"
      onClick={props.onClick}
    >
      <h1 className="font-bold text-lg">{props.name}</h1>
    </div>
  );
}
