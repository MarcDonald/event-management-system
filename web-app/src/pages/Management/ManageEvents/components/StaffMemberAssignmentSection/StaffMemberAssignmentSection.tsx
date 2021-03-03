import React, { useEffect, useState } from 'react';
import StaffMember from '../../../../../shared/models/StaffMember';
import { DropdownItem } from '../../../../../shared/components/Dropdown';
import NewStaffAssignmentEntry from './NewStaffAssignmentEntry';
import RemovableListItem from '../../../../../shared/components/RemovableListItem';
import AssignedStaffMember from '../../../../../shared/models/AssignedStaffMember';
import Position from '../../../../../shared/models/Position';
import styled from 'styled-components';

interface StaffMemberAssignmentSectionProps {
  selectableStaff: StaffMember[];
  selectablePositions: Position[];
  assignedStaff: AssignedStaffMember[];
  assignStaffMember: (staffMember: StaffMember, position: Position) => void;
  unassignStaffMember: (staffMember: StaffMember) => void;
}

const Container = styled.section`
  margin: 0.5rem 0;
`;

const Title = styled.h3`
  margin: 0.5rem 0;
  text-align: center;
  font-weight: bold;
  font-size: 1.5rem;
`;

const StaffName = styled.p`
  font-weight: bold;
`;

const PositionName = styled.p`
  font-size: 1.25rem;
`;

/**
 * Displays a list of assigned staff members as well as the input to assign more staff members
 */
export default function StaffMemberAssignmentSection(
  props: StaffMemberAssignmentSectionProps
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

  const assignedStaffDisplayList = () => {
    return props.assignedStaff.map((assignedStaffMember) => (
      <RemovableListItem
        key={assignedStaffMember.staffMember.sub}
        listKey={assignedStaffMember.staffMember.sub}
        content={
          <div>
            <StaffName>{`${assignedStaffMember.staffMember.givenName} ${assignedStaffMember.staffMember.familyName}`}</StaffName>
            <PositionName>{assignedStaffMember.position.name}</PositionName>
          </div>
        }
        deleteAction={() => {
          props.unassignStaffMember(assignedStaffMember.staffMember);
        }}
      />
    ));
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
    <Container>
      <Title>Staff</Title>
      {assignedStaffDisplayList()}
      <NewStaffAssignmentEntry
        staffToShow={staffDropdownItems}
        positionsToShow={positionDropdownItems}
        onSave={assignStaffMember}
      />
    </Container>
  );
}
