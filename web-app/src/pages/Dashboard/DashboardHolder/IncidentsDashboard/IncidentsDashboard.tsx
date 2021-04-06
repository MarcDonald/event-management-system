import React from 'react';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import AssistanceRequestCard from '../../../../shared/components/AssistanceRequestCard';
import styled from 'styled-components';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IncidentsDashboardProps {
  assistanceRequests: AssistanceRequest[];
  onHandleAssistanceRequest: (id: string) => void;
}

const Container = styled.section`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 72vh;
`;

const NoRequestsContainer = styled.div`
  max-height: 72vh;
  height: 72vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
`;

const NoRequestsIcon = styled(FontAwesomeIcon)`
  font-size: 4rem;
  margin: 1rem;
`;

/**
 * Dashboard showing the incidents (assistance requests) of an event in a list, including both handled and unhandled incidents
 */
export default function IncidentsDashboard({
  assistanceRequests,
  onHandleAssistanceRequest,
}: IncidentsDashboardProps) {
  return (
    <Container>
      {assistanceRequests.length === 0 && (
        <NoRequestsContainer>
          <NoRequestsIcon
            icon={faInbox}
            title="No Assistance Requests"
            aria-label="No Assistance Requests"
          />
          <h2>No Assistance Requests</h2>
        </NoRequestsContainer>
      )}
      {assistanceRequests.length > 0 &&
        assistanceRequests
          .sort((request1, request2) => {
            if (request1.time > request2.time) {
              return -1;
            } else if (request1.time < request2.time) {
              return 1;
            } else {
              return 0;
            }
          })
          .map((request) => (
            <AssistanceRequestCard
              key={request.assistanceRequestId}
              assistanceRequest={request}
              onHandledClick={onHandleAssistanceRequest}
            />
          ))}
    </Container>
  );
}
