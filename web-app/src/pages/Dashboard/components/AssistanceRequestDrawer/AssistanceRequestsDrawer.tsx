import React from 'react';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import AssistanceRequestDrawerCard from './AssistanceRequestDrawerCard';
import Loading from '../../../../shared/components/Loading';
import { SideNavTitle } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

const NoRequestsIcon = styled(FontAwesomeIcon)`
  margin: 1rem;
  font-size: 3rem;
`;

const NoRequestsContainer = styled.div`
  margin: 2rem 1rem 0 1rem;
  text-align: center;
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
    const unhandledRequests = assistanceRequests.filter(
      (request) => !request.handled
    );

    if (isLoading) {
      return <Loading />;
    } else if (unhandledRequests.length === 0) {
      return (
        <NoRequestsContainer>
          <NoRequestsIcon
            icon={faInbox}
            title="No Unhandled Assistance Requests"
            aria-label="No Unhandled Assistance Requests"
          />
          <h4>No Unhandled Assistance Requests</h4>
        </NoRequestsContainer>
      );
    } else {
      return unhandledRequests
        .sort((request1, request2) => {
          if (request1.time > request2.time) {
            return -1;
          } else if (request1.time < request2.time) {
            return 1;
          } else {
            return 0;
          }
        })
        .map((assistanceRequest) => {
          return (
            <AssistanceRequestDrawerCard
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
