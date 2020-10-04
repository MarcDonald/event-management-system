import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../Animations.css';

interface AsyncButtonPropTypes {
  text: string;
  enabledClassName: string;
  disabledClassName: string;
  disabled: boolean;
  type: 'submit' | 'reset' | 'button' | undefined;
  isLoading: boolean;
}

export default function AsyncButton(props: AsyncButtonPropTypes) {
  return (
    <button
      disabled={props.disabled}
      type={props.type}
      className={
        props.disabled ? props.disabledClassName : props.enabledClassName
      }
    >
      {props.isLoading && (
        <FontAwesomeIcon icon={faSpinner} className="spinning" />
      )}
      {!props.isLoading && props.text}
    </button>
  );
}
