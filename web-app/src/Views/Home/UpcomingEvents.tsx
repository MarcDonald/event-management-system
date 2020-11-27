import React, { useEffect, useState } from 'react';
import { sleep } from '../../Services/ApiService';
import Loading from '../../Components/Loading';
import Card from '../../Components/Card';
import Event from '../../Models/Event';
import { getUpcomingEvents } from '../../Services/EventService';

interface UpcomingEventsPropTypes {}

export default function UpcomingEvents(props: UpcomingEventsPropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    const setup = async () => {
      await sleep(1000);
      const upcoming = await getUpcomingEvents();
      setUpcomingEvents(upcoming);
      setIsLoading(false);
    };
    setup().then();
  }, []);

  const eventList = () => {
    return upcomingEvents.map((event) => {
      return (
        <Card key={event.eventId} className="mt-2 text-center">
          <h1 className="font-semibold text-xl">{event.name}</h1>
          <h2 className="font-normal text-md">{event.venue.name}</h2>
          <h3 className="font-normal text-md">{`${new Date(
            event.start * 1000
          ).toDateString()} - ${new Date(
            event.end * 1000
          ).toDateString()}`}</h3>
        </Card>
      );
    });
  };

  return (
    <div className="self-center w-1/2">
      <h1 className="text-3xl font-bold text-center mt-4">Upcoming Events</h1>
      {isLoading && <Loading containerClassName="mt-4" />}
      {!isLoading && upcomingEvents.length > 0 && eventList()}
      {!isLoading && upcomingEvents.length <= 0 && (
        <h1 className="text-2xl font-normal text-center mt-4">
          No Upcoming Events
        </h1>
      )}
    </div>
  );
}
