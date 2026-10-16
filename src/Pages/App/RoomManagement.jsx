import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';
import { EmptyState, ErrorState, LoadingState, Panel, Status, Table, useConfirm } from './DashboardParts';

const emptyRoom = { roomNumber: '', propertyId: '', roomType: '', floor: '1', status: 'available', isClean: true };
const roomStatuses = ['available', 'occupied', 'reserved', 'maintenance', 'cleaning'];

const RoomManagement = () => {
  const confirm = useConfirm();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [newRoom, setNewRoom] = useState(emptyRoom);
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(emptyRoom);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [uploadingId, setUploadingId] = useState('');
  const [error, setError] = useState('');
  const fileInputRefs = useRef({});

  const load = useCallback(async () => {
    const [roomResult, typeResult, propertyResult] = await Promise.allSettled([
      api.get('/rooms'),
      api.get('/rooms/types'),
      api.get('/properties')
    ]);
    setError('');
    if (roomResult.status === 'fulfilled') setRooms(roomResult.value.data.rooms || []);
    if (typeResult.status === 'fulfilled') setRoomTypes(typeResult.value.data.roomTypes || []);
    if (propertyResult.status === 'fulfilled') setProperties(propertyResult.value.data.properties || []);
    const failed = [roomResult, typeResult, propertyResult].find(result => result.status === 'rejected');
    if (failed) setError(getApiErrorMessage(failed.reason, 'Room inventory could not be loaded.'));
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const createRoom = async event => {
    event.preventDefault();
    setWorkingId('create');
    setError('');
    try {
      await api.post('/rooms', {
        ...newRoom,
        ...(newRoom.propertyId ? { propertyId: newRoom.propertyId } : {}),
        floor: Number(newRoom.floor),
        isClean: newRoom.isClean === true
      });
      setNewRoom(emptyRoom);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room could not be created.'));
    } finally {
      setWorkingId('');
    }
  };

  const startEditing = room => {
    setEditingId(room._id);
    setEditForm({
      roomNumber: room.roomNumber,
      propertyId: room.propertyId?._id || room.propertyId || '',
      roomType: room.roomType?._id || room.roomType || '',
      floor: String(room.floor),
      status: room.status,
      isClean: room.isClean
    });
  };

  const saveRoom = async roomId => {
    setWorkingId(roomId);
    setError('');
    try {
      await api.patch(`/rooms/${roomId}`, {
        ...editForm,
        ...(editForm.propertyId ? { propertyId: editForm.propertyId } : {}),
        floor: Number(editForm.floor),
        isClean: editForm.isClean === true
      });
      setEditingId('');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room changes could not be saved.'));
    } finally {
      setWorkingId('');
    }
  };

  const removeRoom = async room => {
    const approved = await confirm({
      title: 'Delete room',
      message: `Delete room ${room.roomNumber}? This cannot be undone.`,
      confirmLabel: 'Delete room'
    });
    if (!approved) return;
    setWorkingId(room._id);
    setError('');
    try {
      await api.delete(`/rooms/${room._id}`);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room could not be deleted.'));
    } finally {
      setWorkingId('');
    }
  };

  const uploadRoomImages = async (event, room) => {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (!files.length) return;
    if ((room.images?.length || 0) + files.length > 10) {
      setError(`Room ${room.roomNumber} can have at most 10 images.`);
      return;
    }

    setUploadingId(room._id);
    setError('');
    try {
      const body = new FormData();
      files.forEach(file => body.append('images', file));
      await api.post(`/uploads/rooms/${room._id}/images`, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room images could not be uploaded.'));
    } finally {
      setUploadingId('');
    }
  };

  const roomFields = (form, update) => <>
    <label className="dash-field">Room number<input required maxLength="20" value={form.roomNumber} onChange={event => update(current => ({ ...current, roomNumber: event.target.value }))} /></label>
    {properties.length > 0 && <label className="dash-field">Property<select required value={form.propertyId || ''} onChange={event => update(current => ({ ...current, propertyId: event.target.value }))}><option value="">Choose property</option>{properties.filter(property => property.status === 'Active').map(property => <option key={property._id} value={property._id}>{property.propertyName}</option>)}</select></label>}
    <label className="dash-field">Room type<select required value={form.roomType} onChange={event => update(current => ({ ...current, roomType: event.target.value }))}><option value="">Choose type</option>{roomTypes.map(type => <option key={type._id} value={type._id}>{type.title}</option>)}</select></label>
    <label className="dash-field">Floor<input required type="number" min="0" step="1" value={form.floor} onChange={event => update(current => ({ ...current, floor: event.target.value }))} /></label>
    <label className="dash-field">Status<select value={form.status} onChange={event => update(current => ({ ...current, status: event.target.value }))}>{roomStatuses.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
    <label className="dash-field dash-room-clean-field"><span>Clean and ready</span><input type="checkbox" checked={form.isClean} onChange={event => update(current => ({ ...current, isClean: event.target.checked }))} /></label>
  </>;

  return (
    <Panel id="rooms" title="Room inventory" meta={`${rooms.length} rooms · create, edit or remove`}>
      {error && <ErrorState message={error} onRetry={() => { setLoading(true); void load(); }} />}
      <form className="dash-panel-body dash-room-form" onSubmit={createRoom}>
        <strong>Add a room</strong>
        {roomTypes.length === 0
          ? <EmptyState>Create a room type before adding rooms.</EmptyState>
          : <>
            <div className="dash-form-grid">{roomFields(newRoom, setNewRoom)}</div>
            <button className="dash-button" type="submit" disabled={workingId === 'create'}><Plus size={14} />{workingId === 'create' ? 'Adding…' : 'Add room'}</button>
          </>}
      </form>
      {loading ? <LoadingState label="Loading room inventory…" /> : (
        <Table rows={rooms} empty="No rooms have been added yet." columns={[
          { label: 'Room', render: room => editingId === room._id
            ? <input aria-label="Room number" value={editForm.roomNumber} onChange={event => setEditForm(current => ({ ...current, roomNumber: event.target.value }))} />
            : <strong>{room.roomNumber}</strong> },
          ...(properties.length > 0 ? [{ label: 'Property', render: room => editingId === room._id
            ? <select aria-label="Property" value={editForm.propertyId || ''} onChange={event => setEditForm(current => ({ ...current, propertyId: event.target.value }))}><option value="">Unassigned</option>{properties.filter(property => property.status === 'Active').map(property => <option key={property._id} value={property._id}>{property.propertyName}</option>)}</select>
            : room.propertyId?.propertyName || 'Unassigned' }] : []),
          { label: 'Type', render: room => editingId === room._id
            ? <select aria-label="Room type" value={editForm.roomType} onChange={event => setEditForm(current => ({ ...current, roomType: event.target.value }))}>{roomTypes.map(type => <option key={type._id} value={type._id}>{type.title}</option>)}</select>
            : room.roomType?.title || '—' },
          { label: 'Floor', render: room => editingId === room._id
            ? <input aria-label="Floor" type="number" min="0" value={editForm.floor} onChange={event => setEditForm(current => ({ ...current, floor: event.target.value }))} />
            : room.floor },
          { label: 'Status', render: room => editingId === room._id
            ? <select aria-label="Room status" value={editForm.status} onChange={event => setEditForm(current => ({ ...current, status: event.target.value }))}>{roomStatuses.map(status => <option key={status} value={status}>{status}</option>)}</select>
            : <Status value={room.status} /> },
          { label: 'Clean', render: room => editingId === room._id
            ? <input aria-label="Room is clean" type="checkbox" checked={editForm.isClean} onChange={event => setEditForm(current => ({ ...current, isClean: event.target.checked }))} />
            : room.isClean ? 'Yes' : 'No' },
          { label: 'Images', render: room => (
            <div className="dash-roomtype-images">
              {(room.images || []).map((src, index) => (
                <div key={`${src}-${index}`} className="dash-roomtype-thumb">
                  <img src={src} alt={`Room ${room.roomNumber} ${index + 1}`} loading="lazy" />
                </div>
              ))}
              <input
                ref={element => { fileInputRefs.current[room._id] = element; }}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                hidden
                onChange={event => uploadRoomImages(event, room)}
              />
              <button
                type="button"
                className="dash-roomtype-upload"
                onClick={() => fileInputRefs.current[room._id]?.click()}
                disabled={uploadingId === room._id || Boolean(workingId) || (room.images?.length || 0) >= 10}
              >
                <ImagePlus size={14} />
                {uploadingId === room._id ? 'Uploading…' : `Add images (${room.images?.length || 0}/10)`}
              </button>
            </div>
          ) },
          { label: 'Actions', render: room => editingId === room._id
            ? <div className="dash-toolbar"><button className="dash-button" type="button" disabled={workingId === room._id} onClick={() => saveRoom(room._id)}><Save size={13} />Save</button><button className="dash-button-secondary" type="button" onClick={() => setEditingId('')}><X size={13} />Cancel</button></div>
            : <div className="dash-toolbar"><button className="dash-button-secondary" type="button" disabled={Boolean(workingId)} onClick={() => startEditing(room)}>Edit</button><button className="dash-button-danger" type="button" disabled={Boolean(workingId)} onClick={() => removeRoom(room)}><Trash2 size={13} />Delete</button></div> }
        ]} />
      )}
      <div className="dash-panel-body dash-room-refresh"><button className="dash-button-secondary" type="button" disabled={loading} onClick={() => { setLoading(true); void load(); }}><RefreshCw size={13} />Refresh rooms</button></div>
    </Panel>
  );
};

export default RoomManagement;
