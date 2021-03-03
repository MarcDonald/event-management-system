import React from 'react';
import AsyncButton from '../../../../shared/components/AsyncButton';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import AssistanceRequestCard from './AssistanceRequestCard';
import Loading from '../../../../shared/components/Loading';
import { SideNavTitle } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';

interface AssistanceRequestsDrawerProps {
  refresh: () => void;
  isLoading: boolean;
  assistanceRequests: AssistanceRequest[];
  onHandleAssistanceRequest: (id: string) => void;
}

const Container = styled.div`
  grid-column-start: 6;
  display: grid;
  background-color: ${(props) => props.theme.surface};
`;

const RefreshButtonContainer = styled.div`
  align-self: end;
  margin: 0.5rem;
  text-align: center;
`;

const RefreshButton = styled(AsyncButton)`
  width: 90%;
`;

/**
 * Displays a list of Assistance Requests in a side drawer
 */
export default function AssistanceRequestsDrawer({
  refresh,
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
      <section>
        <SideNavTitle>Assistance Requests</SideNavTitle>
        {assistanceRequestListDisplay()}
      </section>
      <RefreshButtonContainer>
        {!isLoading && (
          <RefreshButton
            onClick={refresh}
            text="Refresh"
            isLoading={isLoading}
          />
        )}
      </RefreshButtonContainer>
    </Container>
  );
}
