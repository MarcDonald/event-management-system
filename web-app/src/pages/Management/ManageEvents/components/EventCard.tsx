import React, { MouseEventHandler } from 'react';
import styled from 'styled-components';
import { Card } from '../../../../styles/GlobalStyles';

interface EventCardProps {
  name: string;
  venueName: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
}

const EventName = styled.p`
  font-weight: bold;
  font-size: 1.25rem;
  text-align: center;
`;

const VenueName = styled.p`
  font-size: 1rem;
  text-align: center;
`;

/**
 * Card that displays basic event information
 */
export default function EventCard(props: EventCardProps) {
  return (
    <Card onClick={props.onClick} isSelected={props.isSelected}>
      <EventName>{props.name}</EventName>
      <VenueName>{props.venueName}</VenueName>
    </Card>
  );
}
