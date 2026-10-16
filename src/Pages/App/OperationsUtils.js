export const SERVICE_TYPES = [
  ['room_service', 'Room service'],
  ['laundry', 'Laundry'],
  ['extra_amenities', 'Extra amenities'],
  ['housekeeping', 'Housekeeping'],
  ['technical', 'Technical support'],
  ['wake_up_call', 'Wake-up call'],
  ['transportation', 'Transportation'],
  ['other', 'Other']
];

export const serviceTransitions = {
  requested: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: []
};

export const getServiceActions = status => serviceTransitions[status] || [];

export const getUserId = user => user?.id || user?._id || '';
