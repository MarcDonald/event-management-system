import React from 'react';
import Position from '../../../../shared/models/Position';
import AssignedStaffMember from '../../../../shared/models/AssignedStaffMember';
import AssistanceRequest from '../../../../shared/models/AssistanceRequest';
import { ListHeaders, PositionsList } from './PositionsDashboardStyles';
import PositionListItem from './PositionListItem';

interface PositionsDashboardProps {
  positions: Position[];
  assignedStaff: AssignedStaffMember[];
  assistanceRequests: AssistanceRequest[];
  onHandleAssistanceRequest: (id: string) => void;
}

/**
 * Dashboard showing the positions of an event in a list and the current status of each position
 */
export default function PositionsDashboard(props: PositionsDashboardProps) {
  return (
    <section>
      <ListHeaders>
        <span>Position</span>
        <span>Status</span>
      </ListHeaders>
      <PositionsList>
        {props.positions.map((position, index) => {
          return (
            <PositionListItem
              key={position.positionId}
              isFinal={index !== props.positions.length - 1}
              position={position}
              assistanceRequests={props.assistanceRequests.filter(
                (request) => request.position.positionId === position.positionId
              )}
              onHandleAssistanceRequest={props.onHandleAssistanceRequest}
            />
          );
        })}
      </PositionsList>
    </section>
  );
}
