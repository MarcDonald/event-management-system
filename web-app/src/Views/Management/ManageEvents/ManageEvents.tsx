import React, { useEffect, useReducer } from 'react';
import ItemListDrawer from '../ItemListDrawer';
import ManagementEditHeader from '../ManagementEditHeader';
import Loading from '../../../Components/Loading';
import EventCard from './EventCard';
import {
  createNewEvent,
  deleteEvent,
  getAllEvents,
  updateEventInformation,
  updateEventStaffMembers,
  updateEventSupervisors,
} from '../../../Services/EventService';
import Dropdown from '../../../Components/Dropdown';
import { getAllVenues } from '../../../Services/VenueService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAllStaffMembers } from '../../../Services/StaffService';
import StaffMemberAssignmentSection from './StaffMemberAssignmentSection/StaffMemberAssignmentSection';
import SupervisorAssignmentSection from './SupervisorAssignmentSection/SupervisorAssignmentSection';
import ManageEventsStateReducer, {
  manageEventsDefaultState,
} from './State/ManageEventsStateReducer';
import ManageEventsStateActions from './State/ManageEventsStateActions';
import { toast } from 'react-hot-toast';

/**
 * Events management page
 */
export default function ManageEvents() {
  const [state, dispatch] = useReducer(
    ManageEventsStateReducer,
    manageEventsDefaultState
  );

  const eventSearch = (searchContent: string) => {
    dispatch({
      type: ManageEventsStateActions.Search,
      parameters: { searchContent },
    });
  };

  useEffect(() => {
    const setup = async () => {
      const allEventsReq = getAllEvents();
      const allVenuesReq = getAllVenues();
      const allStaffReq = getAllStaffMembers();
      Promise.all([allEventsReq, allVenuesReq, allStaffReq]).then((values) => {
        dispatch({
          type: ManageEventsStateActions.DataLoaded,
          parameters: {
            eventsList: values[0],
            venuesList: values[1],
            staffList: values[2],
          },
        });
      });
    };
    setup().then();
  }, []);

  const validateForm = (): boolean => {
    try {
      if (state.name.length < 1) {
        throw new Error('Name is too short');
      }
      if (!state.venue) {
        throw new Error('Cannot create an event without a venue');
      }
      if (state.start > state.end) {
        throw new Error('An event cannot end before it begins');
      }
      if (state.supervisors.length < 1) {
        throw new Error('Cannot create an event with no supervisors');
      }
      if (state.staff.length < 1) {
        throw new Error('Cannot create an event with no staff');
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const saveNewEvent = async (): Promise<void> => {
    const newEvent = await createNewEvent({
      name: state.name,
      // This is a safe non-null assertion because the form has already been validated
      venue: state.venue!,
      // Have to divide by 1000 because JavaScript uses milliseconds instead of seconds to store epoch time
      start: state.start.getTime() / 1000,
      end: state.end.getTime() / 1000,
      supervisors: state.supervisors,
      staff: state.staff,
    });
    dispatch({
      type: ManageEventsStateActions.NewEventSaved,
      parameters: { newEvent },
    });
  };

  const updateEvent = async (): Promise<void> => {
    if (state.id) {
      const updatedInformation = {
        name: state.name,
        // Have to divide by 1000 because JavaScript uses milliseconds instead of seconds to store epoch time
        start: state.start.getTime() / 1000,
        end: state.end.getTime() / 1000,
      };
      await updateEventInformation(state.id, updatedInformation);
      const updatedSupervisors = state.supervisors;
      await updateEventSupervisors(state.id, updatedSupervisors);
      const updatedStaffMembers = state.staff;
      await updateEventStaffMembers(state.id, updatedStaffMembers);
      dispatch({
        type: ManageEventsStateActions.ExistingEventUpdated,
        parameters: {
          updatedId: state.id,
          updatedName: state.name,
        },
      });
    } else {
      throw new Error('Trying to update without an event ID');
    }
  };

  const formSubmit = async (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    if (validateForm()) {
      dispatch({ type: ManageEventsStateActions.Save });
      try {
        // If there's no ID then it will be a new event
        if (!state.id) {
          await toast.promise(saveNewEvent(), {
            error: 'Error Adding New Event',
            loading: 'Saving New Event',
            success: 'New Event Saved',
          });
        } else {
          await toast.promise(updateEvent(), {
            error: 'Error Updating Event',
            loading: 'Updating Event',
            success: 'Event Updated',
          });
        }
        dispatch({ type: ManageEventsStateActions.SetupNewEvent });
      } catch (error) {
        dispatch({ type: ManageEventsStateActions.SaveError });
      }
    }
  };

  const formDelete = async () => {
    if (state.id) {
      dispatch({ type: ManageEventsStateActions.Delete });
      try {
        await toast.promise(deleteEvent(state.id), {
          error: 'Error Deleting Event',
          loading: 'Deleting Event',
          success: 'Event Deleted',
        });
        dispatch({
          type: ManageEventsStateActions.DeleteSuccess,
          parameters: { deletedId: state.id },
        });
        dispatch({ type: ManageEventsStateActions.SetupNewEvent });
      } catch (error) {
        dispatch({
          type: ManageEventsStateActions.DeleteError,
          parameters: { error },
        });
      }
    } else {
      dispatch({ type: ManageEventsStateActions.SetupNewEvent });
    }
  };

  const header = () => {
    return (
      <>
        {state.name && (
          <ManagementEditHeader
            delete={formDelete}
            title={state.name}
            save={() => formSubmit(null)}
            disableButtons={state.disableButtons}
          />
        )}
        {!state.name && (
          <ManagementEditHeader
            delete={formDelete}
            title="New Event"
            save={() => formSubmit(null)}
            disableButtons={state.disableButtons}
          />
        )}
      </>
    );
  };

  const eventList = () => {
    if (state.isLoadingEvents) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return state.displayedEvents.map((event) => {
        return (
          <EventCard
            key={event.eventId}
            name={event.name}
            venueName={event.venue.name}
            isSelected={event.eventId === state.id}
            onClick={() =>
              dispatch({
                type: ManageEventsStateActions.SelectEventToEdit,
                parameters: { selectedId: event.eventId },
              })
            }
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
          value={state.name}
          className="form-input"
          placeholder="Name"
          onChange={(event) =>
            dispatch({
              type: ManageEventsStateActions.FieldChange,
              parameters: {
                fieldName: event.target.id,
                fieldValue: event.target.value,
              },
            })
          }
        />
        <label htmlFor="venue">Venue</label>
        <Dropdown
          disabled={!!state.id}
          title="Select a venue"
          currentlySelectedKey={state.venue?.venueId}
          list={state.dropdownVenues}
          onSelected={(venueId) =>
            dispatch({
              type: ManageEventsStateActions.SelectVenue,
              parameters: { venueId },
            })
          }
        />
        <label htmlFor="start">Start Date</label>
        <DatePicker
          id="start"
          selected={new Date(state.start)}
          className="form-input w-full"
          placeholderText="Start Date"
          onChange={(date) => {
            if (date) {
              dispatch({
                type: ManageEventsStateActions.FieldChange,
                parameters: {
                  fieldName: 'start',
                  fieldValue: date,
                },
              });
            }
          }}
        />
        <label htmlFor="start">End Date</label>
        <DatePicker
          id="end"
          selected={new Date(state.end)}
          className="form-input w-full"
          placeholderText="End Date"
          onChange={(date) => {
            if (date) {
              dispatch({
                type: ManageEventsStateActions.FieldChange,
                parameters: {
                  fieldName: 'end',
                  fieldValue: date,
                },
              });
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
          {state.venue && (
            <section className="col-start-1 col-span-4 grid grid-cols-6">
              <div className="col-start-1 col-span-2">
                <SupervisorAssignmentSection
                  selectableStaff={state.selectableStaff}
                  assignedSupervisors={state.supervisors}
                  assignSupervisor={(supervisor, areaOfSupervision) =>
                    dispatch({
                      type: ManageEventsStateActions.AssignSupervisor,
                      parameters: { supervisor, areaOfSupervision },
                    })
                  }
                  unassignSupervisor={(supervisor) =>
                    dispatch({
                      type: ManageEventsStateActions.UnassignSupervisor,
                      parameters: { supervisor },
                    })
                  }
                />
              </div>
              <div className="col-start-5 col-span-2">
                <StaffMemberAssignmentSection
                  selectableStaff={state.selectableStaff}
                  selectablePositions={state.selectablePositions}
                  assignedStaff={state.staff}
                  assignStaffMember={(staffMember, position) =>
                    dispatch({
                      type: ManageEventsStateActions.AssignStaff,
                      parameters: { staffMember, position },
                    })
                  }
                  unassignStaffMember={(staffMember) =>
                    dispatch({
                      type: ManageEventsStateActions.UnassignStaff,
                      parameters: { staffMember },
                    })
                  }
                />
              </div>
            </section>
          )}
        </div>
      </div>
      <ItemListDrawer
        title="Events"
        newButtonClick={() =>
          dispatch({ type: ManageEventsStateActions.SetupNewEvent })
        }
        newButtonText="New Event"
        onSearch={eventSearch}
        displayedList={eventList()}
      />
    </div>
  );
}
