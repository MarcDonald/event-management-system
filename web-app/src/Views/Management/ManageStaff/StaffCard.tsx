import React, { MouseEventHandler } from 'react';
import Card from '../../../Components/Card';

interface StaffCardPropTypes {
  name: string;
  username: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export default function StaffCard(props: StaffCardPropTypes) {
  return (
    <Card onClick={props.onClick}>
      <h1 className="font-bold text-lg">{props.name}</h1>
      <h2 className="text-md">{props.username}</h2>
    </Card>
  );
}
