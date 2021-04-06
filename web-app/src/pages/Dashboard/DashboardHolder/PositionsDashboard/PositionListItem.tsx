import React, { useEffect, useState } from 'react';
import {
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Position from '../../../../shared/models/Position';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import AssistanceRequestCard from '../../../../shared/components/AssistanceRequestCard';

interface PositionListItemPropTypes {
  isFinal: boolean;
  position: Position;
  assistanceRequests: Array<AssistanceRequest>;
  onHandleAssistanceRequest: (id: string) => void;
}

const Container = styled.div<{ isFinal: boolean }>`
  border-bottom-width: ${(props) => (props.isFinal ? '1px' : 0)};
  border-color: ${(props) => props.theme.darkerGray};
  margin: 0 8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  text-align: center;
  padding: 0.5rem 0;
  align-items: center;
`;

const AssistanceRequestIcon = styled(FontAwesomeIcon)<{
  hasassistancerequest: any;
}>`
  font-size: 1.5rem;
  color: ${(props) =>
    props.hasassistancerequest ? props.theme.negative : props.theme.positive};
  margin-right: 1rem;
`;

const RequestsListContainer = styled.div`
  grid-column: span 3 / span 3;
  text-align: start;
`;

const NoRequestsDisplay = styled.h3`
  grid-column: span 3 / span 3;
  text-align: center;
`;

export default function PositionListItem({
  isFinal,
  position,
  assistanceRequests,
  onHandleAssistanceRequest,
}: PositionListItemPropTypes) {
  const [showRequests, setShowRequests] = useState(false);
  const [hasAssistanceRequest, setHasAssistanceRequest] = useState(false);

  useEffect(() => {
    setHasAssistanceRequest(
      !!assistanceRequests.find((request) => !request.handled)
    );
  }, [assistanceRequests]);

  return (
    <Container isFinal={isFinal} key={position.positionId}>
      <p>{position.name}</p>
      <div>
        <AssistanceRequestIcon
          hasassistancerequest={hasAssistanceRequest ? 1 : 0}
          icon={hasAssistanceRequest ? faExclamationTriangle : faCheckCircle}
          title={`${
            hasAssistanceRequest
              ? 'Assistance Request'
              : 'No Assistance Requests'
          }`}
          aria-label={`${
            hasAssistanceRequest
              ? 'Assistance Request'
              : 'No Assistance Requests'
          }`}
        />
      </div>
      <div>
        <Button onClick={() => setShowRequests((prev) => !prev)}>
          {showRequests ? 'Hide Requests' : 'View Requests'}
        </Button>
      </div>
      {showRequests && assistanceRequests.length > 0 && (
        <RequestsListContainer>
          {assistanceRequests.map((request) => (
            <AssistanceRequestCard
              key={request.assistanceRequestId}
              assistanceRequest={request}
              onHandledClick={() =>
                onHandleAssistanceRequest(request.assistanceRequestId)
              }
            />
          ))}
        </RequestsListContainer>
      )}
      {showRequests && assistanceRequests.length === 0 && (
        <NoRequestsDisplay>
          Position Has No Assistance Requests
        </NoRequestsDisplay>
      )}
    </Container>
  );
}
