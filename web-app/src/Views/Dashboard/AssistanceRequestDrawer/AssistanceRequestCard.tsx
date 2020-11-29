import React, { useState } from 'react';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import Card from '../../../Components/Card';

interface AssistanceRequestCardPropTypes {
  assistanceRequest: AssistanceRequest;
}

export default function AssistanceRequestCard(
  props: AssistanceRequestCardPropTypes
) {
  return (
    <Card className="m-2">
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
