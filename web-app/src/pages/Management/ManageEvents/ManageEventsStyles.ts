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

export const Label = styled.label`
  text-align: center;
`;

export const LabelWithTopMargin = styled(Label)`
  margin-top: 0.5rem;
`;

export const AssignmentSection = styled.section`
  grid-column-start: 1;
  grid-column: span 4 / span 4;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
`;

export const SupervisorAssignmentSectionContainer = styled.div`
  grid-column-start: 1;
  grid-column-end: 3;
`;

export const StaffAssignmentSectionContainer = styled.div`
  grid-column-start: 5;
  grid-column-end: 7;
`;

export const LoadingContainer = styled.div`
  margin-top: 1rem;
`;
