import React, { useEffect, useState } from 'react';
import StaffMember from '../../../../../shared/models/StaffMember';
import { DropdownItem } from '../../../../../shared/components/Dropdown';
import RemovableListItem from '../../../../../shared/components/RemovableListItem';
import NewSupervisorAssignmentEntry from './NewSupervisorAssignmentEntry';
import AssignedSupervisor from '../../../../../shared/models/AssignedSupervisor';
import styled from 'styled-components';

interface SupervisorAssignmentSectionProps {
  selectableStaff: StaffMember[];
  assignedSupervisors: AssignedSupervisor[];
  assignSupervisor: (
    staffMember: StaffMember,
    areaOfSupervision: string
  ) => void;
  unassignSupervisor: (supervisor: StaffMember) => void;
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

const AreaOfSupervision = styled.p`
  font-size: 1.25rem;
`;
/**
 * Displays a list of assigned supervisors as well as the input to assign more supervisors
 */
export default function SupervisorAssignmentSection(
  props: SupervisorAssignmentSectionProps
) {
  const [supervisorDropdownItems, setSupervisorDropdownItems] = useState<
    DropdownItem[]
  >([]);

  useEffect(() => {
    setSupervisorDropdownItems(
      props.selectableStaff.map((supervisor) => {
        return {
          key: supervisor.username,
          name: `${supervisor.givenName} ${supervisor.familyName}`,
        };
      })
    );
  }, [props.selectableStaff]);

  const assignedStaffDisplayList = () => {
    return props.assignedSupervisors.map((assignedStaffMember) => (
      <RemovableListItem
        key={assignedStaffMember.staffMember.sub}
        listKey={assignedStaffMember.staffMember.sub}
        content={
          <div>
            <StaffName>{`${assignedStaffMember.staffMember.givenName} ${assignedStaffMember.staffMember.familyName}`}</StaffName>
            <AreaOfSupervision>
              {assignedStaffMember.areaOfSupervision}
            </AreaOfSupervision>
          </div>
        }
        deleteAction={() => {
          props.unassignSupervisor(assignedStaffMember.staffMember);
        }}
      />
    ));
  };

  const assignSupervisor = (staffId: string, areaOfSupervision: string) => {
    const staffMember = props.selectableStaff.find(
      (staffMember) => staffMember.username === staffId
    );
    if (staffMember && areaOfSupervision) {
      props.assignSupervisor(staffMember, areaOfSupervision);
    }
  };

  return (
    <Container>
      <Title>Supervisors</Title>
      {assignedStaffDisplayList()}
      <NewSupervisorAssignmentEntry
        staffToShow={supervisorDropdownItems}
        onSave={assignSupervisor}
      />
    </Container>
  );
}
