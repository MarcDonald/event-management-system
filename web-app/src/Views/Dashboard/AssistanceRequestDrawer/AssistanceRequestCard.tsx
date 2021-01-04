import React, { useState } from 'react';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import Card from '../../../Components/Card';

/**
 * Card to display Assistance Request information
 */
interface AssistanceRequestCardPropTypes {
  assistanceRequest: AssistanceRequest;
}

export default function AssistanceRequestCard(
  props: AssistanceRequestCardPropTypes
) {
  return (
    <Card className="my-2 mx-3">
      <h1 className="font-bold text-xl">
        {props.assistanceRequest.position.name}
      </h1>
      <h2 className="text-lg">{props.assistanceRequest.message}</h2>
      <h3 className="text-md">
        At {new Date(props.assistanceRequest.time * 1000).toTimeString()}
      </h3>
    </Card>
  );
}
