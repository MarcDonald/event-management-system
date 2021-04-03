import React from 'react';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import AssistanceRequestCard from './AssistanceRequestCard';
import Loading from '../../../../shared/components/Loading';
import { SideNavTitle } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';

interface AssistanceRequestsDrawerProps {
  isLoading: boolean;
  assistanceRequests: AssistanceRequest[];
  onHandleAssistanceRequest: (id: string) => void;
}

const Container = styled.div`
  grid-column-start: 6;
  display: grid;
  background-color: ${(props) => props.theme.surface};
  max-height: 94vh;
  height: 94vh;
`;

const RequestList = styled.section`
  height: 90vh;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

/**
 * Displays a list of Assistance Requests in a side drawer
 */
export default function AssistanceRequestsDrawer({
  isLoading,
  assistanceRequests,
  onHandleAssistanceRequest,
}: AssistanceRequestsDrawerProps) {
  const assistanceRequestListDisplay = () => {
    if (isLoading) {
      return <Loading />;
    } else {
      return assistanceRequests
        .sort((request1, request2) => {
          if (request1.time > request2.time) {
            return -1;
          } else if (request1.time < request2.time) {
            return 1;
          } else {
            return 0;
          }
        })
        .filter((request) => !request.handled)
        .map((assistanceRequest) => {
          return (
            <AssistanceRequestCard
              assistanceRequest={assistanceRequest}
              key={assistanceRequest.assistanceRequestId}
              onHandledClick={onHandleAssistanceRequest}
            />
          );
        });
    }
  };

  return (
    <Container>
      <SideNavTitle>Assistance Requests</SideNavTitle>
      <RequestList>{assistanceRequestListDisplay()}</RequestList>
    </Container>
  );
}
