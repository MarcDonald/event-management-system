import React from 'react';
import Loading from '../../shared/components/Loading';
import { Button } from '../../styles/GlobalStyles';
import styled from 'styled-components';

interface LoginButtonProps {
  text: string;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button';
  isLoading: boolean;
  onClick?: () => void;
}

const ButtonStyle = styled(Button)`
  width: 100%;
  margin: 1rem 0;
`;

/**
 * Button that displays a spinner when logging in
 */
export default function LoginButton(props: LoginButtonProps) {
  return (
    <ButtonStyle
      disabled={props.disabled || props.isLoading}
      type={props.type ? props.type : 'button'}
      onClick={() => {
        if (props.onClick) props.onClick();
      }}
    >
      {props.isLoading && <Loading />}
      {!props.isLoading && props.text}
    </ButtonStyle>
  );
}
