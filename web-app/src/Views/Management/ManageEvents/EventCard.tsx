import React, { MouseEventHandler, useState } from 'react';
import Card from '../../../Components/Card';

interface EventCardPropTypes {
  name: string;
  venueName: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
}

export default function EventCard(props: EventCardPropTypes) {
  return (
    <Card onClick={props.onClick} isSelected={props.isSelected}>
      <h1 className="font-bold text-lg text-center">{props.name}</h1>
      <h2 className="text-md text-center">{props.venueName}</h2>
    </Card>
  );
}