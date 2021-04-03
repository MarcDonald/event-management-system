import React, { useEffect, useState } from 'react';
import Loading from '../../../shared/components/Loading';
import Event from '../../../shared/models/Event';
import { Card } from '../../../styles/GlobalStyles';
import { getUpcomingEvents } from '../../../services/EventService';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  align-self: center;
  width: 50%;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
`;

const LoadingContainer = styled.div`
  margin-top: 1rem;
`;

const NoEventsSubtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: normal;
  text-align: center;
  margin-top: 1rem;
`;

const UpcomingEventCard = styled(Card)`
  margin-top: 0.5rem;
  text-align: center;
`;

const UpcomingEventName = styled.p`
  font-weight: 600;
  font-size: 1.25rem;
`;

const UpcomingEventVenue = styled.p`
  font-weight: normal;
  font-size: 1rem;
`;

const UpcomingEventDate = styled.p`
  font-weight: normal;
  font-size: 1rem;
`;

const EventListContainer = styled.div`
  max-height: 50vh;
  overflow-x: hidden;
  overflow-y: auto;
`;

/**
 * Fetches a list of upcoming events and displays them
 */
export default function UpcomingEvents() {
  const history = useHistory();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    const setup = async () => {
      const upcoming = await getUpcomingEvents();
      setUpcomingEvents(upcoming);
      setIsLoading(false);
    };
    setup().then();
  }, []);

  const eventList = () => {
    return upcomingEvents.map((event) => {
      return (
        <UpcomingEventCard
          key={event.eventId}
          onClick={() => history.push(`/dashboard/${event.eventId}`)}
        >
          <UpcomingEventName>{event.name}</UpcomingEventName>
          <UpcomingEventVenue>{event.venue.name}</UpcomingEventVenue>
          <UpcomingEventDate>{`${new Date(
            event.start * 1000
          ).toDateString()} - ${new Date(
            event.end * 1000
          ).toDateString()}`}</UpcomingEventDate>
        </UpcomingEventCard>
      );
    });
  };

  return (
    <Container>
      <Title>Upcoming Events</Title>
      {isLoading && (
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      )}
      {!isLoading && upcomingEvents.length > 0 && (
        <EventListContainer>{eventList()}</EventListContainer>
      )}
      {!isLoading && upcomingEvents.length <= 0 && (
        <NoEventsSubtitle>No Upcoming Events</NoEventsSubtitle>
      )}
    </Container>
  );
}
