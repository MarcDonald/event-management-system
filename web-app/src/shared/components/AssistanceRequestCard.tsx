import React from 'react';
import AssistanceRequest from '../models/AssistanceRequest';
import { Card, Button } from '../../styles/GlobalStyles';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface AssistanceRequestCardProps {
  assistanceRequest: AssistanceRequest;
  onHandledClick: (id: string) => void;
}

const CardContainer = styled(Card)`
  margin: 1rem;
  display: grid;
  grid-template-columns: 1fr auto;
  cursor: default;

  :hover,
  :focus {
    transform: none;
  }
`;

const Message = styled.h2`
  font-weight: normal;
  font-size: 1.7rem;
`;

const IncidentInfo = styled.h3`
  font-weight: normal;
`;

const KeyInfoSpan = styled.span`
  font-weight: 600;
`;

const HandledSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HandledIconContainer = styled.div`
  background-color: ${(props) => props.theme.positive};
  border-radius: 1000px;
  padding: 0.5rem;
  margin: auto;
  vertical-align: center;
`;

export const HandledIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  color: #ffffff;
`;

/**
 * Card to display Assistance Request information
 */
export default function AssistanceRequestCard({
  assistanceRequest,
  onHandledClick,
}: AssistanceRequestCardProps) {
  return (
    <CardContainer>
      <div>
        <Message>
          <KeyInfoSpan>{assistanceRequest.message}</KeyInfoSpan>
        </Message>
        <IncidentInfo>
          from <KeyInfoSpan>{assistanceRequest.position.name}</KeyInfoSpan> at{' '}
          <KeyInfoSpan>
            {new Date(assistanceRequest.time * 1000).toLocaleTimeString()}
          </KeyInfoSpan>
        </IncidentInfo>
      </div>
      <HandledSection>
        {assistanceRequest.handled && (
          <HandledIconContainer>
            <HandledIcon
              icon={faCheck}
              title="Request Handled"
              aria-label="Request Handled"
            />
          </HandledIconContainer>
        )}
        {!assistanceRequest.handled && (
          <Button
            onClick={() =>
              onHandledClick(assistanceRequest.assistanceRequestId)
            }
          >
            Mark as Handled
          </Button>
        )}
      </HandledSection>
    </CardContainer>
  );
}
