import { describe, expect, it } from 'vitest';
import { getServiceActions, getUserId, SERVICE_TYPES } from './OperationsUtils';

describe('operations dashboard helpers', () => {
  it('offers the backend-supported guest service request choices', () => {
    expect(SERVICE_TYPES.map(([type]) => type)).toEqual([
      'room_service',
      'laundry',
      'extra_amenities',
      'housekeeping',
      'technical',
      'wake_up_call',
      'transportation',
      'other'
    ]);
  });

  it('only offers legal next service request statuses', () => {
    expect(getServiceActions('requested')).toEqual(['accepted', 'cancelled']);
    expect(getServiceActions('accepted')).toEqual(['in_progress', 'cancelled']);
    expect(getServiceActions('in_progress')).toEqual(['fulfilled', 'cancelled']);
    expect(getServiceActions('fulfilled')).toEqual([]);
    expect(getServiceActions('unknown')).toEqual([]);
  });

  it('resolves either supported authentication user identifier', () => {
    expect(getUserId({ id: 'id-user', _id: 'mongo-user' })).toBe('id-user');
    expect(getUserId({ _id: 'mongo-user' })).toBe('mongo-user');
    expect(getUserId(null)).toBe('');
  });
});
