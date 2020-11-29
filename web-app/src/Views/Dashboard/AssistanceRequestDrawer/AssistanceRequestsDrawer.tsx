import React, { useState } from 'react';
import AsyncButton from '../../../Components/AsyncButton';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import AssistanceRequestCard from './AssistanceRequestCard';
import Loading from '../../../Components/Loading';

interface AssistanceRequestsDrawerPropTypes {
  refresh: () => any | void;
  isLoading: boolean;
  assistanceRequests: AssistanceRequest[];
}

export default function AssistanceRequestsDrawer(
  props: AssistanceRequestsDrawerPropTypes
) {
  const assistanceRequestListDisplay = () => {
    if (props.isLoading) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return props.assistanceRequests.map((assistanceRequest) => {
        return (
          <AssistanceRequestCard
            assistanceRequest={assistanceRequest}
            key={assistanceRequest.assistanceRequestId}
          />
        );
      });
    }
  };

  return (
    <div className="col-start-6 grid bg-white">
      <section>
        <h1 className="side-nav-title">Assistance Requests</h1>
        {assistanceRequestListDisplay()}
      </section>
      <section className="self-end m-2">
        {!props.isLoading && (
          <AsyncButton
            enabledClassName="btn w-full"
            onClick={props.refresh}
            text="Refresh"
            isLoading={props.isLoading}
          />
        )}
      </section>
    </div>
  );
}
