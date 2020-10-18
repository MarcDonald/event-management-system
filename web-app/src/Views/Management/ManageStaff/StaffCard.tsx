import React, { MouseEventHandler } from 'react';

interface StaffCardPropTypes {
  name: string;
  username: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export default function StaffCard(props: StaffCardPropTypes) {
  return (
    <div
      className="bg-inactive-gray my-2 hover:bg-active-gray cursor-pointer p-2 rounded-md"
      onClick={props.onClick}
    >
      <h1 className="font-bold text-lg">{props.name}</h1>
      <h2 className="text-md">{props.username}</h2>
    </div>
  );
}
