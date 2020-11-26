import React, { MouseEventHandler } from 'react';
import Card from '../../../Components/Card';

interface VenueCardPropTypes {
  name: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
}

export default function VenueCard(props: VenueCardPropTypes) {
  return (
    <Card onClick={props.onClick} isSelected={props.isSelected}>
      <h1 className="font-bold text-lg text-center">{props.name}</h1>
    </Card>
  );
}
