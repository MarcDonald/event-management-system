import styled from 'styled-components';

export const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  width: 20vw;
  grid-column-start: 2;
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

export const Label = styled.label`
  text-align: center;
`;

export const LabelWithTopGap = styled(Label)`
  margin-top: 0.5rem;
`;
