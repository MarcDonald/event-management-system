import React from 'react';
import Position from '../../../../Models/Position';
import AssignedStaffMember from '../../../../Models/AssignedStaffMember';
import AssistanceRequest from '../../../../Models/AssistanceRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

interface PositionsDashboardPropTypes {
  positions: Position[];
  assignedStaff: AssignedStaffMember[];
  assistanceRequests: AssistanceRequest[];
}

/**
 * Dashboard showing the positions of an event in a list and the current status of each position
 */
export default function PositionsDashboard(props: PositionsDashboardPropTypes) {
  const listHeaderDisplay = () => {
    return (
      <div className="mx-32 grid grid-cols-3 text-center py-2 items-center font-bold text-2xl">
        <span>Position</span>
        <span>Status</span>
      </div>
    );
  };

  const positionDisplayList = () => {
    return props.positions.map((position, index) => {
      const hasAssistanceRequest = props.assistanceRequests.find((request) => {
        return (
          request.position.positionId === position.positionId &&
          !request.handled
        );
      });

      let borderStyle = '';
      if (index !== props.positions.length - 1) {
        borderStyle = 'border-b border-darker-gray';
      }

      return (
        <div
          className={`${borderStyle} mx-32 grid grid-cols-3 text-center py-2 items-center`}
          key={position.positionId}
        >
          <div>{position.name}</div>
          <div>
            {hasAssistanceRequest && (
              <span className="text-red-600 text-2xl">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="mr-4"
                />
              </span>
            )}
            {!hasAssistanceRequest && (
              <span className="text-green-600 text-2xl">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-4" />
              </span>
            )}
          </div>
          <div>
            <button
              className="btn"
              onClick={() =>
                onViewRequestsForPositionClick(position.positionId)
              }
            >
              View Requests
            </button>
          </div>
        </div>
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
    <div>
      {listHeaderDisplay()}
      {positionDisplayList()}
    </div>
  );
}
