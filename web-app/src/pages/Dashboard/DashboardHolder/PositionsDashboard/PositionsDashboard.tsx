import React from 'react';
import Position from '../../../../shared/models/Position';
import AssignedStaffMember from '../../../../shared/models/AssignedStaffMember';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import {
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { Button } from '../../../../styles/GlobalStyles';
import {
  AssistanceRequestIcon,
  ListHeaders,
  PositionListItem,
  PositionsList,
} from './PositionsDashboardStyles';

interface PositionsDashboardProps {
  positions: Position[];
  assignedStaff: AssignedStaffMember[];
  assistanceRequests: AssistanceRequest[];
}

/**
 * Dashboard showing the positions of an event in a list and the current status of each position
 */
export default function PositionsDashboard(props: PositionsDashboardProps) {
  const listHeaderDisplay = () => {
    return (
      <ListHeaders>
        <span>Position</span>
        <span>Status</span>
      </ListHeaders>
    );
  };

  const checkForAssistanceRequest = (positionId: string): boolean => {
    const findResult = props.assistanceRequests.find((request) => {
      return request.position.positionId === positionId && !request.handled;
    });
    return findResult !== null && findResult !== undefined;
  };

  const positionDisplayList = () => {
    return props.positions.map((position, index) => {
      const hasAssistanceRequest = checkForAssistanceRequest(
        position.positionId
      );
      return (
        <PositionListItem
          isFinal={index !== props.positions.length - 1}
          key={position.positionId}
        >
          <p>{position.name}</p>
          <div>
            <AssistanceRequestIcon
              hasAssistanceRequest={hasAssistanceRequest}
              icon={
                hasAssistanceRequest ? faExclamationTriangle : faCheckCircle
              }
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
            <Button
              onClick={() =>
                onViewRequestsForPositionClick(position.positionId)
              }
            >
              View Requests
            </Button>
          </div>
        </PositionListItem>
      );
    });
  };

  const onViewRequestsForPositionClick = (positionId: string) => {
    props.assistanceRequests
      .filter((request) => request.position.positionId === positionId)
      .map((request) =>
        toast(`${request.message} - Handled: ${request.handled}`)
      );
  };

  return (
    <section>
      {listHeaderDisplay()}
      <PositionsList>{positionDisplayList()}</PositionsList>
    </section>
  );
}
