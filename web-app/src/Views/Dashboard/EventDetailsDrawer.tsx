import React from 'react';
import LoginStateDisplay from '../../Components/LoginStateDisplay';
import AssignedSupervisor from '../../Models/AssignedSupervisor';
import Card from '../../Components/Card';

interface EventDetailsDrawerPropTypes {
  venueName: string;
  eventName: string;
  supervisors: AssignedSupervisor[];
}

/**
 * Drawer that displays the basic details of the event as well as the supervisors assigned to the event
 */
export default function EventDetailsDrawer(props: EventDetailsDrawerPropTypes) {
  const supervisorDisplayList = () => {
    return props.supervisors.map((supervisor) => {
      return (
        <Card
          className="mt-2 mx-3 transition-none transform-none cursor-auto"
          key={supervisor.staffMember.sub}
        >
          <h1 className="font-bold text-xl">
            {supervisor.staffMember.givenName}{' '}
            {supervisor.staffMember.familyName}
          </h1>
          <h2>{supervisor.areaOfSupervision}</h2>
        </Card>
      );
    });
  };

  return (
    <div className="col-start-1 grid bg-white">
      <section>
        <div className="m-4 p-2 rounded-md text-white bg-brand text-center">
          <h1 className="font-bold text-2xl">{props.venueName}</h1>
          <h2 className="text-lg">{props.eventName}</h2>
        </div>
        <h1 className="side-nav-title">Supervisors</h1>
        {supervisorDisplayList()}
      </section>
      <section className="self-end">
        <LoginStateDisplay showHomeButton={true} />
      </section>
    </div>
  );
}
