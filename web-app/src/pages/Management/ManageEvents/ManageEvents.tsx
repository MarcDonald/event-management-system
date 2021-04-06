import React, { useEffect, useReducer } from 'react';
import ItemListDrawer from '../components/ItemListDrawer';
import ManagementEditHeader from '../components/ManagementEditHeader';
import Loading from '../../../shared/components/Loading';
import EventCard from './components/EventCard';
import Dropdown from '../../../shared/components/Dropdown';
import 'react-datepicker/dist/react-datepicker.css';
import StaffMemberAssignmentSection from './components/StaffMemberAssignmentSection/StaffMemberAssignmentSection';
import SupervisorAssignmentSection from './components/SupervisorAssignmentSection/SupervisorAssignmentSection';
import ManageEventsStateReducer, {
  manageEventsDefaultState,
} from './state/ManageEventsStateReducer';
import ManageEventsStateActions from './state/ManageEventsStateActions';
import { toast } from 'react-hot-toast';
import { FormInput, DatePickerInput } from '../../../styles/GlobalStyles';
import {
  Container,
  MainSection,
  FormGrid,
  FormContainer,
  Form,
  Label,
  LabelWithTopMargin,
  AssignmentSection,
  StaffAssignmentSectionContainer,
  SupervisorAssignmentSectionContainer,
  LoadingContainer,
} from './ManageEventsStyles';
import useStaffApi from '../../../shared/hooks/api/useStaffApi';
import useVenueApi from '../../../shared/hooks/api/useVenueApi';
import useEventApi from '../../../shared/hooks/api/useEventApi';

/**
 * Events management page
 */
export default function ManageEvents() {
  const staffApi = useStaffApi();
  const venueApi = useVenueApi();
  const eventApi = useEventApi();

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
    const cancelTokenSource = eventApi.getCancelTokenSource();

    const setup = async () => {
      const allEventsReq = eventApi.getAllEvents(cancelTokenSource.token);
      const allVenuesReq = venueApi.getAllVenues(cancelTokenSource.token);
      const allStaffReq = staffApi.getAllStaffMembers(cancelTokenSource.token);
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
    setup()
      .then()
      .catch((err) => {
        if (err.message === 'Component unmounted') return;
        else console.error(err);
      });

    return () => {
      cancelTokenSource.cancel('Component unmounted');
    };
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
    const newEvent = await eventApi.createNewEvent({
      name: state.name,
      // This is a safe non-null assertion because the form has already been validated
      venue: state.venue!,
      // Have to divide by 1000 and round it down because JavaScript uses milliseconds instead of seconds to store epoch time
      start: Math.floor(state.start.getTime() / 1000),
      end: Math.floor(state.end.getTime() / 1000),
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
        start: Math.floor(state.start.getTime() / 1000),
        end: Math.floor(state.end.getTime() / 1000),
      };
      await eventApi.updateEventInformation(state.id, updatedInformation);
      const updatedSupervisors = state.supervisors;
      await eventApi.updateEventSupervisors(state.id, updatedSupervisors);
      const updatedStaffMembers = state.staff;
      await eventApi.updateEventStaffMembers(state.id, updatedStaffMembers);
      dispatch({
        type: ManageEventsStateActions.ExistingEventUpdated,
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
        await toast.promise(eventApi.deleteEvent(state.id), {
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

  const eventList = () => {
    if (state.isLoadingEvents) {
      return (
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      );
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
      <Form onSubmit={formSubmit}>
        <Label htmlFor="name">Name</Label>
        <FormInput
          id="name"
          inputMode="text"
          type="text"
          value={state.name}
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
        <LabelWithTopMargin htmlFor="venue">Venue</LabelWithTopMargin>
        <Dropdown
          disabled={!!state.id || state.allVenues?.length === 0}
          title="Select a Venue"
          currentlySelectedKey={state.venue?.venueId}
          list={state.dropdownVenues}
          onSelected={(venueId) =>
            dispatch({
              type: ManageEventsStateActions.SelectVenue,
              parameters: { venueId },
            })
          }
        />
        <LabelWithTopMargin htmlFor="start">Start Date</LabelWithTopMargin>
        <DatePickerInput
          id="start"
          selected={new Date(state.start)}
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
        <LabelWithTopMargin htmlFor="start">End Date</LabelWithTopMargin>
        <DatePickerInput
          id="end"
          selected={new Date(state.end)}
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
      </Form>
    );
  };

  return (
    <Container>
      <MainSection>
        <ManagementEditHeader
          delete={formDelete}
          title={state.name ? state.name : 'New Event'}
          save={() => formSubmit(null)}
          disableButtons={state.disableButtons}
        />
        <FormGrid>
          <FormContainer>{eventDetailsForm()}</FormContainer>
          {state.venue && (
            <AssignmentSection>
              <SupervisorAssignmentSectionContainer>
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
              </SupervisorAssignmentSectionContainer>
              <StaffAssignmentSectionContainer>
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
              </StaffAssignmentSectionContainer>
            </AssignmentSection>
          )}
        </FormGrid>
      </MainSection>
      <ItemListDrawer
        title="Events"
        newButtonClick={() =>
          dispatch({ type: ManageEventsStateActions.SetupNewEvent })
        }
        newButtonText="New Event"
        onSearch={eventSearch}
        displayedList={eventList()}
      />
    </Container>
  );
}
