import React, { useState } from 'react';
import AsyncButton from '../../Components/AsyncButton';
import AssistanceRequest from '../../Models/AssistanceRequest';
import Card from '../../Components/Card';
import AssistanceRequestCard from './AssistanceRequestCard';

interface AssistanceRequestsDrawerPropTypes {
  refresh: () => any | void;
  isLoading: boolean;
  assistanceRequests: AssistanceRequest[];
}

export default function AssistanceRequestsDrawer(
  props: AssistanceRequestsDrawerPropTypes
) {
  const assistanceRequestListDisplay = () => {
    return props.assistanceRequests.map((assistanceRequest) => {
      return <AssistanceRequestCard assistanceRequest={assistanceRequest} />;
    });
  };

  return (
    <div className="col-start-6 grid bg-white">
      <section>
        <h1 className="side-nav-title">Assistance Requests</h1>
        {assistanceRequestListDisplay()}
      </section>
      <section className="self-end m-2">
        <AsyncButton
          enabledClassName="btn w-full"
          onClick={props.refresh}
          text="Refresh"
          isLoading={props.isLoading}
        />
      </section>
    </div>
  );
}
