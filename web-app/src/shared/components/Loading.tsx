import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
`;

const LoadingIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Loading spinner
 */
export default function Loading() {
  return (
    <Container>
      <LoadingIcon icon={faSpinner} />
    </Container>
  );
}
