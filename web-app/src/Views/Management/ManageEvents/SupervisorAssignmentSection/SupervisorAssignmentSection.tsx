import React, { useEffect, useState } from 'react';
import StaffMember from '../../../../Models/StaffMember';
import { DropdownItem } from '../../../../Components/Dropdown';
import RemovableListItem from '../../../../Components/RemovableListItem';
import NewSupervisorAssignmentEntry from './NewSupervisorAssignmentEntry';
import AssignedSupervisor from '../../../../Models/AssignedSupervisor';

interface SupervisorAssignmentSectionPropTypes {
  selectableStaff: StaffMember[];
  assignedSupervisors: AssignedSupervisor[];
  assignSupervisor: (
    staffMember: StaffMember,
    areaOfSupervision: string
  ) => void;
  unassignSupervisor: (supervisor: StaffMember) => void;
}
/**
 * Displays a list of assigned supervisors as well as the input to assign more supervisors
 */
export default function SupervisorAssignmentSection(
  props: SupervisorAssignmentSectionPropTypes
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

  const assignedStaffMemberItemContent = (
    staffName: string,
    areaOfSupervision: string
  ) => {
    return (
      <div>
        <p className="font-bold">{staffName}</p>
        <p className="text-lg">{areaOfSupervision}</p>
      </div>
    );
  };

  const assignedStaffDisplayList = () => {
    return props.assignedSupervisors.map((assignedStaffMember) => {
      return (
        <RemovableListItem
          key={assignedStaffMember.staffMember.sub}
          listKey={assignedStaffMember.staffMember.sub}
          content={assignedStaffMemberItemContent(
            `${assignedStaffMember.staffMember.givenName} ${assignedStaffMember.staffMember.familyName}`,
            assignedStaffMember.areaOfSupervision
          )}
          deleteAction={() => {
            props.unassignSupervisor(assignedStaffMember.staffMember);
          }}
        />
      );
    });
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
    <section className="my-2">
      <h3 className="my-2 text-center font-bold text-2xl">Supervisors</h3>
      {assignedStaffDisplayList()}
      <NewSupervisorAssignmentEntry
        staffToShow={supervisorDropdownItems}
        onSave={assignSupervisor}
      />
    </section>
  );
}
