enum ManageEventsStateActions {
  DataLoaded,
  SetupNewEvent,
  Search,
  SelectEventToEdit,
  ValidationError,
  ExistingEventUpdated,
  Save,
  NewEventSaved,
  SaveError,
  FinishedSaving,
  Delete,
  DeleteError,
  DeleteSuccess,
  FinishedDeleting,
  AssignSupervisor,
  UnassignSupervisor,
  AssignStaff,
  UnassignStaff,
  SelectVenue,
  FieldChange,
}

export default ManageEventsStateActions;
