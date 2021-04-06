import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  height: 100%;
`;

export const MainSection = styled.section`
  grid-column: span 4 / span 4;
  margin: 0 4rem;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  max-height: 84vh;
  overflow-y: auto;
`;

export const FormContainer = styled.div`
  grid-column-start: 2;
  grid-column-end: 4;
  margin-top: 2rem;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export const PositionSelectionSection = styled.section`
  margin: 0.5rem 0;
`;

export const PositionsTitle = styled.h3`
  margin: 0.5rem 0;
  text-align: center;
  font-weight: bold;
  font-size: 1.5rem;
`;

export const LoadingContainer = styled.div`
  margin-top: 1rem;
`;
