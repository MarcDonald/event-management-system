import React from 'react';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import AssistanceRequestCard from '../../../../shared/components/AssistanceRequestCard';
import styled from 'styled-components';

interface IncidentsDashboardProps {
  assistanceRequests: AssistanceRequest[];
  onHandleAssistanceRequest: (id: string) => void;
}

export const Container = styled.section`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 72vh;
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
      {assistanceRequests
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
