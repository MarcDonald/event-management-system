import React, { MouseEventHandler } from 'react';
import styled from 'styled-components';
import { Card } from '../../../../styles/GlobalStyles';

interface VenueCardProps {
  name: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
}

const NameText = styled.p`
  font-weight: bold;
  font-size: 1.125rem;
  text-align: center;
`;

/**
 * Card that displays basic Venue details
 */
export default function VenueCard(props: VenueCardProps) {
  return (
    <Card onClick={props.onClick} isSelected={props.isSelected}>
      <NameText>{props.name}</NameText>
    </Card>
  );
}
