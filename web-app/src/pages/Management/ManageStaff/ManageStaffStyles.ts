import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  height: 100%;
`;

export const MainSection = styled.div`
  grid-column: span 4 / span 4;
  margin: 0 4rem;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
`;

export const Form = styled.form`
  grid-column-start: 2;
  grid-column-end: 4;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  text-align: center;
`;

export const LabelWithTopMargin = styled(Label)`
  margin-top: 0.5rem;
`;

export const LoadingContainer = styled.div`
  margin-top: 1rem;
`;
