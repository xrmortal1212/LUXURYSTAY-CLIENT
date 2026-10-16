import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReservationTools from './ReservationTools';
import { api } from '../../Config/api';

vi.mock('../../Config/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  getApiErrorMessage: (error, fallback) => error?.message || fallback
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn() } }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root;
let container;
const propertyId = 'property-downtown';
const locations = [{ _id: propertyId, propertyName: 'LuxuryStay Downtown', address: { city: 'New York' } }];

const changeValue = async (element, value) => {
  await act(async () => {
    const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
};

const submit = async form => {
  await act(async () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
  });
};

describe('ReservationTools', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    api.get.mockImplementation(path => Promise.resolve(path === '/properties/locations'
      ? { data: { locations } }
      : { data: { data: [{
        roomType: { _id: 'suite-1', title: 'Garden Suite', basePrice: 240, images: [], amenities: [] },
        property: locations[0],
        availableCount: 2,
        availableRooms: [{ id: 'room-1', roomNumber: '101' }]
      }] } }));
    api.post.mockImplementation(path => Promise.resolve({
      data: path === '/coupons/validate'
        ? { valid: true, couponCode: 'SAVE10', discountAmount: 48, discountedSubtotal: 432 }
        : { booking: { bookingReference: 'LS-123' } }
    }));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  it('searches date availability and creates a reservation with its coupon', async () => {
    const onCreated = vi.fn();
    await act(async () => root.render(<ReservationTools onCreated={onCreated} />));
    const dates = container.querySelectorAll('input[type="date"]');
    await changeValue(dates[0], '2027-02-10');
    await changeValue(dates[1], '2027-02-12');
    await changeValue(container.querySelector('input[type="number"]'), '2');
    await submit(container.querySelector('form'));

    expect(api.get).toHaveBeenCalledWith('/rooms/search', {
      params: { propertyId, checkInDate: '2027-02-10', checkOutDate: '2027-02-12', guests: '2' }
    });
    expect(container.textContent).toContain('Garden Suite');
    expect(container.textContent).toContain('LuxuryStay Downtown');

    const chooseButton = [...container.querySelectorAll('button')].find(button => button.textContent === 'Choose room type');
    await act(async () => chooseButton.click());
    const coupon = container.querySelector('.reservation-checkout input');
    await changeValue(coupon, '  SAVE10 ');
    const applyButton = [...container.querySelectorAll('.reservation-checkout button')].find(button => button.textContent === 'Apply coupon');
    await act(async () => applyButton.click());
    expect(api.post).toHaveBeenCalledWith('/coupons/validate', {
      couponCode: 'SAVE10',
      roomTypeId: 'suite-1',
      propertyId,
      checkInDate: '2027-02-10',
      checkOutDate: '2027-02-12'
    });
    expect(container.textContent).toContain('SAVE10 applied');
    expect(container.textContent).toContain('$48');
    await submit(container.querySelectorAll('form')[1]);

    expect(api.post).toHaveBeenCalledWith('/bookings', expect.objectContaining({
      roomTypeId: 'suite-1',
      propertyId,
      checkInDate: '2027-02-10',
      checkOutDate: '2027-02-12',
      adults: 2,
      couponCode: 'SAVE10'
    }));
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('does not submit staff reservations without a clean room assignment', async () => {
    api.get.mockImplementation(path => Promise.resolve({
      data: path === '/properties/locations' ? { locations }
        : path === '/rooms/search' ? { data: [{ roomType: { _id: 'suite-1', title: 'Garden Suite' }, property: locations[0], availableCount: 1, availableRooms: [{ id: 'room-1', roomNumber: '101' }] }] }
          : { calendar: [{ roomId: 'room-1', roomNumber: '101', status: 'cleaning', isClean: false }] }
    }));
    await act(async () => root.render(<ReservationTools canAssignRoom guestUserId="guest-1" />));
    const dates = container.querySelectorAll('input[type="date"]');
    expect(container.querySelector('select').value).toBe(propertyId);
    await changeValue(dates[0], '2027-02-10');
    await changeValue(dates[1], '2027-02-12');
    await submit(container.querySelector('form'));
    await act(async () => container.querySelector('button[aria-pressed]')?.click());
    expect(container.textContent).toContain('No clean, available rooms');
    expect(container.querySelector('.reservation-checkout button').disabled).toBe(true);
    expect(api.post).not.toHaveBeenCalled();
  });
});
