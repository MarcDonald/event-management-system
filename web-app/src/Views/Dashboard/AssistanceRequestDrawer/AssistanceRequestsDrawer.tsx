import React from 'react';
import AsyncButton from '../../../Components/AsyncButton';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import AssistanceRequestCard from './AssistanceRequestCard';
import Loading from '../../../Components/Loading';

interface AssistanceRequestsDrawerPropTypes {
  refresh: () => void;
  isLoading: boolean;
  assistanceRequests: AssistanceRequest[];
  onHandleAssistanceRequest: (id: string) => void;
}

/**
 * Displays a list of Assistance Requests in a side drawer
 */
export default function AssistanceRequestsDrawer({
  refresh,
  isLoading,
  assistanceRequests,
  onHandleAssistanceRequest,
}: AssistanceRequestsDrawerPropTypes) {
  const assistanceRequestListDisplay = () => {
    if (isLoading) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return assistanceRequests
        .sort((request1, request2) => {
          if (request1.time > request2.time) {
            return -1;
          } else if (request1.time < request2.time) {
            return 1;
          } else {
            return 0;
          }
        })
        .filter((request) => !request.handled)
        .map((assistanceRequest) => {
          return (
            <AssistanceRequestCard
              assistanceRequest={assistanceRequest}
              key={assistanceRequest.assistanceRequestId}
              onHandledClick={onHandleAssistanceRequest}
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
      <section className="self-end m-2 text-center">
        {!isLoading && (
          <AsyncButton
            className="btn w-11/12"
            onClick={refresh}
            text="Refresh"
            isLoading={isLoading}
          />
        )}
      </section>
    </div>
  );
}
