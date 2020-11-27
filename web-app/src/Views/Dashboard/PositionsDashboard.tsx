import React from 'react';
import Position from '../../Models/Position';
import AssignedStaffMember from '../../Models/AssignedStaffMember';
import AssistanceRequest from '../../Models/AssistanceRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

interface PositionsDashboardPropTypes {
  positions: Position[];
  assignedStaff: AssignedStaffMember[];
  assistanceRequests: AssistanceRequest[];
}

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
        if (request.position.positionId === position.positionId) {
          return true;
        }
      });

      let borderStyle = '';
      if (index !== props.positions.length - 1) {
        borderStyle = 'border-b border-darker-gray';
      }

      return (
        <div
          className={`${borderStyle} mx-32 grid grid-cols-3 text-center py-2 items-center`}
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
            <button className="btn">View Requests</button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="col-start-2 col-span-4 mt-2">
      {listHeaderDisplay()}
      {positionDisplayList()}
    </div>
  );
}
