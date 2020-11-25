import React, { MouseEventHandler } from 'react';
import Card from '../../../Components/Card';

interface VenueCardPropTypes {
  name: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export default function VenueCard(props: VenueCardPropTypes) {
  return (
    <Card onClick={props.onClick}>
      <h1 className="font-bold text-lg">{props.name}</h1>
    </Card>
  );
}
