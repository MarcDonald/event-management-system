import React, { useEffect, useState } from 'react';
import ErrorMessage from '../../../Components/ErrorMessage';
import ListPanel from '../ListPanel';
import ManagementEditHeader from '../ManagementEditHeader';
import AssignedStaffMember from '../../../Models/AssignedStaffMember';
import VenueMetadata from '../../../Models/VenueMetadata';
import Event from '../../../Models/Event';
import { useFormFields } from '../../../Hooks/useFormFields';
import Loading from '../../../Components/Loading';
import EventCard from './EventCard';
import {
  createNewEvent,
  deleteEvent,
  getAllEvents,
} from '../../../Services/EventService';
import Dropdown, { DropdownItem } from '../../../Components/Dropdown';
import Venue from '../../../Models/Venue';
import { getAllVenues } from '../../../Services/VenueService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import NewStaffAssignmentEntry from './NewStaffAssignmentEntry';
import NewSupervisorAssignmentEntry from './NewSupervisorAssignmentEntry';
import AssignedSupervisor from '../../../Models/AssignedSupervisor';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ManageEventsPropTypes {}

interface ManageEventsFormFields {
  id: string | null;
  name: string;
  venue: VenueMetadata | null;
  start: Date;
  end: Date;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
}

const emptyFormFields = {
  id: null,
  name: '',
  venue: null,
  start: new Date(),
  end: new Date(),
  supervisors: [],
  staff: [],
};

export default function ManageEvents(props: ManageEventsPropTypes) {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [fields, setFields, setFieldsDirectly] = useFormFields<
    ManageEventsFormFields
  >(emptyFormFields);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [dropdownVenues, setDropdownVenues] = useState<DropdownItem[]>([]);

  const eventSearch = (searchContent: string) => {
    if (searchContent) {
      searchContent = searchContent.toLowerCase();
      setDisplayedEvents(
        displayedEvents.filter((event) => {
          if (event.name.toLowerCase().includes(searchContent)) {
            return event;
          }
        })
      );
    } else {
      setDisplayedEvents(allEvents);
    }
  };

  const formatDropdownVenues = (venueList: Venue[]): DropdownItem[] => {
    return venueList.map((venue) => {
      return {
        key: venue.venueId,
        name: venue.name,
      };
    });
  };

  useEffect(() => {
    const setup = async () => {
      const eventList = await getAllEvents();
      setIsLoadingEvents(false);
      setAllEvents(eventList);
      setDisplayedEvents(eventList);
      const venueList = await getAllVenues();
      const formattedVenues = formatDropdownVenues(venueList);
      setDropdownVenues(formattedVenues);
    };
    setup().then();
  }, []);

  const setupNewEvent = () => {
    setFieldsDirectly(emptyFormFields);
  };

  const selectEventToEdit = (id: string) => {
    const event = allEvents.find((event) => event.eventId === id);
    if (event) {
      setFieldsDirectly({
        id: event.eventId,
        name: event.name,
        venue: event.venue,
        start: new Date(event.start * 1000),
        end: new Date(event.end * 1000),
        supervisors: event.supervisors,
        staff: event.staff,
      });
    } else {
      console.log(`Setup new event`);
      setupNewEvent();
    }
  };

  const validateForm = (): boolean => {
    if (fields.name.length < 1) {
      setError(new Error('Name is too short'));
      return false;
    }
    if (!fields.venue) {
      setError(new Error('Cannot create an event without a venue'));
    }
    // if (fields.supervisors.length < 1) {
    //   setError(new Error('Cannot create an event with no supervisors'));
    //   return false;
    // }
    // if (fields.staff.length < 1) {
    //   setError(new Error('Cannot create an event with no staff'));
    //   return false;
    // }
    return true;
  };

  const updateEvent = async (): Promise<Event> => {
    if (fields.id) {
      // TODO update metadata
      // TODO update supervisors
      // TODO update staff
    }
    return {
      eventId: fields.id!!,
      name: fields.name,
      venue: fields.venue!!,
      start: fields.start.getTime() / 1000,
      end: fields.end.getTime() / 1000,
      supervisors: fields.supervisors,
      staff: fields.staff,
    };
  };

  const formSave = async (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        if (!fields.id) {
          const newEvent = await createNewEvent({
            name: fields.name,
            venue: fields.venue!!,
            start: fields.start.getTime() / 1000,
            end: fields.end.getTime() / 1000,
            supervisors: fields.supervisors,
            staff: fields.staff,
          });
          allEvents.push(newEvent);
        } else {
          const updatedEvent = await updateEvent();
          const indexOfEvent = allEvents.findIndex(
            (event) => event.eventId === fields.id
          );
          console.log(updatedEvent.start);
          allEvents[indexOfEvent] = {
            ...allEvents[indexOfEvent],
            ...updatedEvent,
          };
        }
        setupNewEvent();
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
        setError(e);
      }
      setIsSaving(false);
    }
  };

  const formDelete = async () => {
    setIsDeleting(true);
    if (fields.id) {
      await deleteEvent(fields.id);
      const listWithoutDeletedEvent = allEvents.filter(
        (event) => event.eventId !== fields.id
      );
      setAllEvents(listWithoutDeletedEvent);
      setDisplayedEvents(listWithoutDeletedEvent);
    }
    setupNewEvent();
    setIsDeleting(false);
  };

  const header = () => {
    return (
      <>
        {fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title={fields.name}
            save={() => formSave(null)}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {!fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title="New Event"
            save={() => formSave(null)}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
      </>
    );
  };

  const eventList = () => {
    if (isLoadingEvents) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return displayedEvents.map((event) => {
        return (
          <EventCard
            key={event.eventId}
            name={event.name}
            venueName={event.venue.name}
            onClick={() => selectEventToEdit(event.eventId)}
          />
        );
      });
    }
  };

  const eventDetailsForm = () => {
    return (
      <form onSubmit={formSave} className="flex flex-col">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          inputMode="text"
          type="text"
          value={fields.name}
          className="form-input"
          placeholder="Name"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
        />
        <label htmlFor="venue">Venue</label>
        <Dropdown
          title="Select a venue"
          list={dropdownVenues}
          onSelected={(key, name) => {
            key = key.toString();
            name = name ? name : '';
            setFieldsDirectly({
              ...fields,
              venue: {
                venueId: key,
                name,
              },
            });
          }}
        />
        <label htmlFor="start">Start Date</label>
        <DatePicker
          id="start"
          selected={new Date(fields.start)}
          className="form-input w-full"
          placeholderText="Start Date"
          onChange={(date: Date) => {
            if (date) {
              setFieldsDirectly({ ...fields, start: date });
            }
          }}
        />
        <label htmlFor="start">End Date</label>
        <DatePicker
          id="end"
          selected={new Date(fields.end)}
          className="form-input w-full"
          placeholderText="End Date"
          onChange={(date: Date) => {
            if (date) {
              setFieldsDirectly({ ...fields, end: date });
            }
          }}
        />
      </form>
    );
  };

  const supervisorList = () => {
    return fields.supervisors.map((supervisor) => {
      return (
        <div
          key={supervisor.user.username}
          className="w-full bg-white p-2 mb-2 flex justify-between items-center rounded-md"
        >
          <p className="text-2xl">
            {supervisor.user.givenName} {supervisor.user.familyName}
          </p>
          <button
            type="button"
            onClick={() => {
              // TODO
            }}
            className="text-center focus:outline-none bg-negative hover:bg-negative-light focus:bg-negative-light rounded-md p-1 text-white w-10 h-10"
          >
            <FontAwesomeIcon
              icon={faTrash}
              className={`text-2xl align-middle`}
            />
          </button>
        </div>
      );
    });
  };

  const staffList = () => {
    // TODO extract to component
    return fields.staff.map((staff) => {
      return (
        <div
          key={staff.user.username}
          className="w-full bg-white p-2 mb-2 flex justify-between items-center rounded-md"
        >
          <p className="text-2xl">
            {staff.user.givenName} {staff.user.familyName}
          </p>
          <button
            type="button"
            onClick={() => {
              // TODO
            }}
            className="text-center focus:outline-none bg-negative hover:bg-negative-light focus:bg-negative-light rounded-md p-1 text-white w-10 h-10"
          >
            <FontAwesomeIcon
              icon={faTrash}
              className={`text-2xl align-middle`}
            />
          </button>
        </div>
      );
    });
  };

  const supervisorSelection = () => {
    return (
      <section className="my-2">
        <h3 className="my-2 text-center font-bold text-2xl">Supervisors</h3>
        {supervisorList()}
        <NewSupervisorAssignmentEntry onSave={() => {}} />
      </section>
    );
  };

  const staffSelection = () => {
    return (
      <section className="my-2">
        <h3 className="my-2 text-center font-bold text-2xl">Staff</h3>
        {staffList()}
        <NewStaffAssignmentEntry onSave={() => {}} />
      </section>
    );
  };

  return (
    <div className="grid grid-cols-5 h-full">
      <div className="col-span-4 mx-16">
        {header()}
        <div className="grid grid-cols-4">
          <div className="col-start-2 col-span-2 mt-4 text-center">
            {eventDetailsForm()}
          </div>
          {fields.venue && (
            <section className="col-start-1 col-span-4 grid grid-cols-6">
              <div className="col-start-1 col-span-2">
                {supervisorSelection()}
              </div>
              <div className="col-start-5 col-span-2">{staffSelection()}</div>
            </section>
          )}
          <div className="col-start-2 col-span-2 mt-4 text-center">
            {error && <ErrorMessage message={error.message} />}
          </div>
        </div>
      </div>
      <ListPanel
        title="Events"
        newButtonClick={setupNewEvent}
        newButtonText="New Event"
        onSearch={eventSearch}
        displayedList={eventList()}
      />
    </div>
  );
}
