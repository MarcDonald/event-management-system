import React, { useEffect, useState } from 'react';
import StaffMember from '../../../../Models/StaffMember';
import { DropdownItem } from '../../../../Components/Dropdown';
import NewStaffAssignmentEntry from './NewStaffAssignmentEntry';
import RemovableListItem from '../../../../Components/RemovableListItem';
import AssignedStaffMember from '../../../../Models/AssignedStaffMember';
import Position from '../../../../Models/Position';

interface StaffMemberAssignmentSectionPropTypes {
  selectableStaff: StaffMember[];
  selectablePositions: Position[];
  assignedStaff: AssignedStaffMember[];
  assignStaffMember: (staffMember: StaffMember, position: Position) => void;
  unassignStaffMember: (staffMember: StaffMember) => void;
}

/**
 * Displays a list of assigned staff members as well as the input to assign more staff members
 */
export default function StaffMemberAssignmentSection(
  props: StaffMemberAssignmentSectionPropTypes
) {
  const [staffDropdownItems, setStaffDropdownItems] = useState<DropdownItem[]>(
    []
  );
  const [positionDropdownItems, setPositionDropdownItems] = useState<
    DropdownItem[]
  >([]);

  useEffect(() => {
    setStaffDropdownItems(
      props.selectableStaff.map((staffMember) => {
        return {
          key: staffMember.username,
          name: `${staffMember.givenName} ${staffMember.familyName}`,
        };
      })
    );
    setPositionDropdownItems(
      props.selectablePositions.map((position) => {
        return {
          key: position.positionId,
          name: position.name,
        };
      })
    );
  }, [props.selectableStaff, props.selectablePositions]);

  const assignedStaffMemberItemContent = (
    staffName: string,
    positionName: string
  ) => {
    return (
      <div>
        <p className="font-bold">{staffName}</p>
        <p className="text-lg">{positionName}</p>
      </div>
    );
  };

  const assignedStaffDisplayList = () => {
    return props.assignedStaff.map((assignedStaffMember) => {
      return (
        <RemovableListItem
          key={assignedStaffMember.staffMember.sub}
          listKey={assignedStaffMember.staffMember.sub}
          content={assignedStaffMemberItemContent(
            `${assignedStaffMember.staffMember.givenName} ${assignedStaffMember.staffMember.familyName}`,
            assignedStaffMember.position.name
          )}
          deleteAction={() => {
            props.unassignStaffMember(assignedStaffMember.staffMember);
          }}
        />
      );
    });
  };

  const assignStaffMember = (staffId: string, positionId: string) => {
    const staffMember = props.selectableStaff.find(
      (staffMember) => staffMember.username === staffId
    );
    const position = props.selectablePositions.find(
      (position) => position.positionId === positionId
    );
    if (staffMember && position) {
      props.assignStaffMember(staffMember, position);
    }
  };

  return (
    <section className="my-2">
      <h3 className="my-2 text-center font-bold text-2xl">Staff</h3>
      {assignedStaffDisplayList()}
      <NewStaffAssignmentEntry
        staffToShow={staffDropdownItems}
        positionsToShow={positionDropdownItems}
        onSave={assignStaffMember}
      />
    </section>
  );
}
