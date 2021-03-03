import React, { MouseEventHandler } from 'react';
import styled from 'styled-components';
import { Card } from '../../../../styles/GlobalStyles';

interface StaffCardProps {
  name: string;
  username: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
}

const NameText = styled.p`
  font-weight: bold;
  font-size: 1.125rem;
  text-align: center;
`;

const UsernameText = styled.p`
  text-align: center;
  font-size: 1rem;
`;

/**
 * Card that displays basic user details
 */
export default function StaffCard(props: StaffCardProps) {
  return (
    <Card onClick={props.onClick} isSelected={props.isSelected}>
      <NameText>{props.name}</NameText>
      <UsernameText>{props.username}</UsernameText>
    </Card>
  );
}
