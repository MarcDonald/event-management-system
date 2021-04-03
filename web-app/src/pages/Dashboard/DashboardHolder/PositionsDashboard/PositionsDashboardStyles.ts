import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ListHeaders = styled.div`
  margin: 0 8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  text-align: center;
  padding: 0.5rem 0;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
`;

export const PositionsList = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 66vh;
`;

export const PositionListItem = styled.div.attrs(
  (props: { isFinal: boolean }) => ({
    isFinal: props.isFinal,
  })
)`
  border-bottom-width: ${(props) => (props.isFinal ? '1px' : 0)};
  border-color: ${(props) => props.theme.darkerGray};
  margin: 0 8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  text-align: center;
  padding: 0.5rem 0;
  align-items: center;
`;

export const AssistanceRequestIcon = styled(FontAwesomeIcon).attrs(
  (props: { hasAssistanceRequest: boolean }) => ({
    hasAssistanceRequest: props.hasAssistanceRequest,
  })
)`
  font-size: 1.5rem;
  color: ${(props) =>
    props.hasAssistanceRequest ? props.theme.negative : props.theme.positive};
  margin-right: 1rem;
`;
