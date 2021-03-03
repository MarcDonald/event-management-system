import React from 'react';
import Loading from './Loading';
import { Button } from '../../styles/GlobalStyles';

interface AsyncButtonProps {
  text: string;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button';
  isLoading: boolean;
  onClick?: () => void;
}

/**
 * Button that displays a spinner when performing an action
 */
export default function AsyncButton(props: AsyncButtonProps) {
  return (
    <Button
      disabled={props.disabled || props.isLoading}
      type={props.type ? props.type : 'button'}
      onClick={() => {
        if (props.onClick) props.onClick();
      }}
    >
      {props.isLoading && <Loading />}
      {!props.isLoading && props.text}
    </Button>
  );
}
