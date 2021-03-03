import styled from 'styled-components';
import AsyncButton from '../../shared/components/AsyncButton';

export const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  grid-column-start: 3;
  grid-column-end: 4;
`;

export const FormInput = styled.input`
  outline: none;
  border-width: 1px;
  border-color: ${(props) => props.theme.darkestGray};
  border-radius: 0.375rem;
  padding: 0.5rem;

  :focus {
    border-color: ${(props) => props.theme.brand};
  }
`;

export const PasswordLabel = styled.label`
  margin-top: 0.5rem;
`;

export const LoginButton = styled(AsyncButton)`
  margin-top: 1rem;
`;
