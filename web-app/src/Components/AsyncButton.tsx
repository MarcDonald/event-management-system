import React from 'react';
import Loading from './Loading';

interface AsyncButtonPropTypes {
  text: string;
  className?: string;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button';
  isLoading: boolean;
  onClick?: () => void;
}

/**
 * Button that displays a spinner when performing an action
 */
export default function AsyncButton(props: AsyncButtonPropTypes) {
  return (
    <button
      disabled={props.disabled || props.isLoading}
      type={props.type ? props.type : 'button'}
      className={`btn ${props.className}`}
      onClick={() => {
        if (props.onClick) props.onClick();
      }}
    >
      {props.isLoading && <Loading />}
      {!props.isLoading && props.text}
    </button>
  );
}
