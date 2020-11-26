import React, { MouseEventHandler } from 'react';
import Card from '../../../Components/Card';

interface StaffCardPropTypes {
  name: string;
  username: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
}

export default function StaffCard(props: StaffCardPropTypes) {
  return (
    <Card onClick={props.onClick} isSelected={props.isSelected}>
      <h1 className="font-bold text-lg text-center">{props.name}</h1>
      <h2 className="text-md text-center">{props.username}</h2>
    </Card>
  );
}
