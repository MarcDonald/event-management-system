import styled from 'styled-components';

export const LoadingContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Container = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.backgroundGray};
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 100%;
`;

export const ContentContainer = styled.div`
  grid-row-start: 2;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
`;
