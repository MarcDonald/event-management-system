import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../Animations.css';

interface AsyncButtonPropTypes {
  text: string;
  enabledClassName?: string;
  disabledClassName?: string;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button';
  isLoading: boolean;
  onClick?: () => void;
}

export default function AsyncButton(props: AsyncButtonPropTypes) {
  const defaultEnabledStyle =
    'bg-brand rounded-md text-white font-semibold p-2 mt-4 hover:bg-brand-light focus:bg-brand-light focus:outline-none';
  const defaultDisabledStyle =
    'bg-gray-500 rounded-md text-white font-semibold p-2 mt-4 cursor-not-allowed focus:outline-none';

  const enabledStyle = props.enabledClassName
    ? props.enabledClassName
    : defaultEnabledStyle;

  const disabledStyle = props.disabledClassName
    ? props.disabledClassName
    : defaultDisabledStyle;

  return (
    <button
      disabled={props.disabled || props.isLoading}
      type={props.type ? props.type : 'button'}
      className={props.disabled ? disabledStyle : enabledStyle}
      onClick={() => {
        if (props.onClick) props.onClick();
      }}
    >
      {props.isLoading && (
        <FontAwesomeIcon icon={faSpinner} className="spinning" />
      )}
      {!props.isLoading && props.text}
    </button>
  );
}
