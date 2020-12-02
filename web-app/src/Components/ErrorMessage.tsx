import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ErrorMessagePropTypes {
  message: string;
}

/**
 * Displays an error message in a prominent box
 */
export default function ErrorMessage(props: ErrorMessagePropTypes) {
  return (
    <div className="text-center mt-2 mb-8 bg-red-200 mx-2 py-2 rounded-md border border-red-400">
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        className="text-negative mr-2"
      />
      <span>{props.message}</span>
    </div>
  );
}
