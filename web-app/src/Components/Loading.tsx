import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface LoadingPropTypes {
  spinnerClassName?: string;
  containerClassName?: string;
}

/**
 * Loading spinner
 */
export default function Loading(props: LoadingPropTypes) {
  return (
    <div className={`text-center ${props.containerClassName}`}>
      <FontAwesomeIcon
        icon={faSpinner}
        className={`spinning text-2xl ${props.spinnerClassName}`}
      />
    </div>
  );
}
