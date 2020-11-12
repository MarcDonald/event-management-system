import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ErrorMessagePropTypes {
  message: string;
}

export default function ErrorMessage(props: ErrorMessagePropTypes) {
  return (
    <div className="text-center mt-2 mb-8">
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        className="text-error mr-2"
      />
      <span>{props.message}</span>
    </div>
  );
}
