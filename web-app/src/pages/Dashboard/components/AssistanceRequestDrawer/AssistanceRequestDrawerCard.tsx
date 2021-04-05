import React from 'react';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import { Button } from '../../../../styles/GlobalStyles';
import { Card } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';

interface AssistanceRequestDrawerCardProps {
  assistanceRequest: AssistanceRequest;
  onHandledClick: (id: string) => void;
}

const HandledButton = styled(Button)`
  grid-column: span 2 / span 2;
  padding: 0.25rem;
  margin-top: 0.25rem;

  :hover,
  :focus {
    transform: none;
  }
`;

const CardContainer = styled(Card)`
  margin: 0.5rem 0.75rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  cursor: default;

  :hover,
  :focus {
    transform: none;
  }
`;

const PositionName = styled.p`
  font-weight: bold;
  font-size: 1.25rem;
`;

const TimeDisplay = styled.p`
  text-align: right;
`;

const Message = styled.p`
  font-size: 1.25rem;
  grid-column: span 2 / span 2;
`;

/**
 * Card to display Assistance Request information
 */
export default function AssistanceRequestDrawerCard({
  assistanceRequest,
  onHandledClick,
}: AssistanceRequestDrawerCardProps) {
  return (
    <CardContainer>
      <PositionName>{assistanceRequest.position.name}</PositionName>
      <TimeDisplay>
        {new Date(assistanceRequest.time * 1000).toLocaleTimeString()}
      </TimeDisplay>
      <Message>{assistanceRequest.message}</Message>
      {!assistanceRequest.handled && (
        <HandledButton
          onClick={() => onHandledClick(assistanceRequest.assistanceRequestId)}
        >
          Mark as Handled
        </HandledButton>
      )}
    </CardContainer>
  );
}
