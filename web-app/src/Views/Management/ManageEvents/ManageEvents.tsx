import React, { useEffect, useState } from 'react';
import ErrorMessage from '../../../Components/ErrorMessage';
import ListPanel from '../ListPanel';
import ManagementEditHeader from '../ManagementEditHeader';
import AssignedStaffMember from '../../../Models/AssignedStaffMember';
import Event from '../../../Models/Event';
import { useFormFields } from '../../../Hooks/useFormFields';
import Loading from '../../../Components/Loading';
import EventCard from './EventCard';
import {
  createNewEvent,
  deleteEvent,
  getAllEvents,
  updateEventMetadata,
  updateEventStaffMembers,
  updateEventSupervisors,
} from '../../../Services/EventService';
import Dropdown, { DropdownItem } from '../../../Components/Dropdown';
import Venue from '../../../Models/Venue';
import { getAllVenues } from '../../../Services/VenueService';
import AssignedSupervisor from '../../../Models/AssignedSupervisor';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import StaffMember from '../../../Models/StaffMember';
import { getAllStaffMembers } from '../../../Services/StaffService';
import StaffMemberAssignmentSection from './StaffMemberAssignmentSection';
import Position from '../../../Models/Position';
import SupervisorAssignmentSection from './SupervisorAssignmentSection';

interface ManageEventsPropTypes {}

interface ManageEventsFormFields {
  id: string | null;
  name: string;
  venue: Venue | null;
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
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [selectableStaff, setSelectableStaff] = useState<StaffMember[]>([]);
  const [selectablePositions, setSelectablePositions] = useState<Position[]>(
    []
  );
  const [allVenues, setAllVenues] = useState<Venue[]>([]);

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
      setAllVenues(venueList);
      const formattedVenues = formatDropdownVenues(venueList);
      setDropdownVenues(formattedVenues);
      const staffList = await getAllStaffMembers();
      setAllStaff(staffList);
      setSelectableStaff(staffList);
    };
    setup().then();
  }, []);

  const setupNewEvent = () => {
    setFieldsDirectly(emptyFormFields);
    setSelectableStaff(allStaff);
    setSelectablePositions([]);
  };

  const selectEventToEdit = (id: string) => {
    const event = allEvents.find((event) => event.eventId === id);
    if (event) {
      setFieldsDirectly({
        id: event.eventId,
        name: event.name,
        venue: event.venue,
        // Have to multiply by 1000 because JavaScript uses milliseconds instead of seconds to store epoch time
        start: new Date(event.start * 1000),
        end: new Date(event.end * 1000),
        supervisors: event.supervisors,
        staff: event.staff,
      });
      setSelectablePositions(event.venue.positions);
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
      return false;
    }
    if (fields.start > fields.end) {
      setError(new Error('An event cannot end before it begins'));
      return false;
    }
    if (fields.supervisors.length < 1) {
      setError(new Error('Cannot create an event with no supervisors'));
      return false;
    }
    if (fields.staff.length < 1) {
      setError(new Error('Cannot create an event with no staff'));
      return false;
    }
    return true;
  };

  const updateEvent = async (): Promise<Event> => {
    if (fields.id) {
      const updatedMetadata = await updateEventMetadata(fields.id, {
        name: fields.name,
        // Have to divide by 1000 because JavaScript uses milliseconds instead of seconds to store epoch time
        start: fields.start.getTime() / 1000,
        end: fields.end.getTime() / 1000,
      });
      const updatedSupervisors = await updateEventSupervisors(
        fields.id,
        fields.supervisors
      );
      const updatedStaffMembers = await updateEventStaffMembers(
        fields.id,
        fields.staff
      );
      return {
        eventId: fields.id!!,
        venue: fields.venue!!,
        supervisors: updatedSupervisors,
        staff: updatedStaffMembers,
        ...updatedMetadata,
      };
    }
    throw new Error('Trying to update without an event ID');
  };

  const formSubmit = async (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        if (!fields.id) {
          const newEvent = await createNewEvent({
            name: fields.name,
            venue: fields.venue!!,
            // Have to divide by 1000 because JavaScript uses milliseconds instead of seconds to store epoch time
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
          allEvents[indexOfEvent] = {
            ...allEvents[indexOfEvent],
            ...updatedEvent,
          };
        }
        setError(null);
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

  const assignSupervisor = (
    supervisor: StaffMember,
    areaOfSupervision: string
  ) => {
    setFieldsDirectly({
      ...fields,
      supervisors: [
        ...fields.supervisors,
        {
          staffMember: supervisor,
          areaOfSupervision,
        },
      ],
    });
    const indexToRemove = selectableStaff.findIndex(
      (staffInArray) => staffInArray.username === supervisor.username
    );
    const newList = [...selectableStaff];
    newList.splice(indexToRemove, 1);
    setSelectableStaff(newList);
  };

  const unassignSupervisor = (supervisor: StaffMember) => {
    const newAssignedList = [...fields.supervisors];
    newAssignedList.splice(
      fields.supervisors.findIndex(
        (assignedStaffMember) =>
          assignedStaffMember.staffMember.username === supervisor.username
      ),
      1
    );
    setFieldsDirectly({ ...fields, supervisors: newAssignedList });
    setSelectableStaff([...selectableStaff, supervisor]);
  };

  const assignStaff = (staffMember: StaffMember, position: Position) => {
    setFieldsDirectly({
      ...fields,
      staff: [
        ...fields.staff,
        {
          staffMember,
          position,
        },
      ],
    });
    const indexToRemove = selectableStaff.findIndex(
      (staffInArray) => staffInArray.username === staffMember.username
    );
    const newList = [...selectableStaff];
    newList.splice(indexToRemove, 1);
    setSelectableStaff(newList);
  };

  const unassignStaff = (staffMember: StaffMember) => {
    const newAssignedList = [...fields.staff];
    newAssignedList.splice(
      fields.staff.findIndex(
        (assignedStaffMember) =>
          assignedStaffMember.staffMember.username === staffMember.username
      ),
      1
    );
    setFieldsDirectly({ ...fields, staff: newAssignedList });
    setSelectableStaff([...selectableStaff, staffMember]);
  };

  const selectVenue = (venueId: string) => {
    if (venueId !== fields.venue?.venueId) {
      const selectedVenue = allVenues.find(
        (venue) => venue.venueId === venueId
      );
      if (selectedVenue) {
        setFieldsDirectly({
          ...fields,
          venue: selectedVenue,
          supervisors: [],
          staff: [],
        });
        setSelectablePositions(selectedVenue.positions);
      }
    }
  };

  const header = () => {
    return (
      <>
        {fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title={fields.name}
            save={() => formSubmit(null)}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {!fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title="New Event"
            save={() => formSubmit(null)}
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
            isSelected={event.eventId === fields.id}
            onClick={() => selectEventToEdit(event.eventId)}
          />
        );
      });
    }
  };

  const eventDetailsForm = () => {
    return (
      <form onSubmit={formSubmit} className="flex flex-col">
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
          currentlySelectedKey={fields.venue?.venueId}
          list={dropdownVenues}
          onSelected={(key) => {
            if (typeof key === 'string') selectVenue(key);
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
                <SupervisorAssignmentSection
                  selectableStaff={selectableStaff}
                  assignedSupervisors={fields.supervisors}
                  assignSupervisor={assignSupervisor}
                  unassignSupervisor={unassignSupervisor}
                />
              </div>
              <div className="col-start-5 col-span-2">
                <StaffMemberAssignmentSection
                  selectableStaff={selectableStaff}
                  selectablePositions={selectablePositions}
                  assignedStaff={fields.staff}
                  assignStaffMember={assignStaff}
                  unassignStaffMember={unassignStaff}
                />
              </div>
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
