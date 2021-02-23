import React from 'react';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import Card from '../../../Components/Card';
import { Button } from 'react-bootstrap';

/**
 * Card to display Assistance Request information
 */
interface AssistanceRequestCardPropTypes {
  assistanceRequest: AssistanceRequest;
  onHandledClick: (id: string) => void;
}

export default function AssistanceRequestCard({
  assistanceRequest,
  onHandledClick,
}: AssistanceRequestCardPropTypes) {
  return (
    <Card className="my-2 mx-3 grid grid-cols-2">
      <h1 className="font-bold text-xl">{assistanceRequest.position.name}</h1>
      <h3 className="text-md text-right">
        {new Date(assistanceRequest.time * 1000).toLocaleTimeString()}
      </h3>
      <h2 className="text-lg col-span-2">{assistanceRequest.message}</h2>
      {!assistanceRequest.handled && (
        <Button
          className="col-span-2 p-1"
          onClick={() => onHandledClick(assistanceRequest.assistanceRequestId)}
        >
          Mark as Handled
        </Button>
      )}
    </Card>
  );
}
