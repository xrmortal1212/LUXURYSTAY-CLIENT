import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, RefreshCw, Save, X } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';
import { ErrorState, LoadingState, Panel, Table, useConfirm } from './DashboardParts';
import './RoomTypeManagement.css';

const emptyRoomType = {
  title: '',
  basePrice: '0',
  maxGuests: '1',
  bedType: '',
  roomSizeSqFt: '200',
  description: '',
  amenities: []
};

const RoomTypeManagement = () => {
  const confirm = useConfirm();
  const [roomTypes, setRoomTypes] = useState([]);
  const [newRoomType, setNewRoomType] = useState(emptyRoomType);
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(emptyRoomType);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [uploadingId, setUploadingId] = useState('');
  const [error, setError] = useState('');
  const fileInputRefs = useRef({});

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/rooms/types');
      setRoomTypes(data.roomTypes || []);
      setError('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room types could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const createRoomType = async event => {
    event.preventDefault();
    setWorkingId('create');
    setError('');
    try {
      await api.post('/rooms/type', {
        title: newRoomType.title.trim(),
        basePrice: Number(newRoomType.basePrice),
        maxGuests: Number(newRoomType.maxGuests),
        bedType: newRoomType.bedType.trim(),
        roomSizeSqFt: Number(newRoomType.roomSizeSqFt),
        description: newRoomType.description.trim() || undefined,
        amenities: []
      });
      setNewRoomType(emptyRoomType);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room type could not be created.'));
    } finally {
      setWorkingId('');
    }
  };

  const startEditing = roomType => {
    setEditingId(roomType._id);
    setEditForm({
      title: roomType.title || '',
      basePrice: String(roomType.basePrice || '0'),
      maxGuests: String(roomType.maxGuests || '1'),
      bedType: roomType.bedType || '',
      roomSizeSqFt: String(roomType.roomSizeSqFt || '200'),
      description: roomType.description || '',
      amenities: (roomType.amenities || []).map(amenity => (typeof amenity === 'object' ? amenity._id : amenity))
    });
  };

  const saveRoomType = async roomTypeId => {
    setWorkingId(roomTypeId);
    setError('');
    try {
      await api.patch(`/rooms/type/${roomTypeId}`, {
        title: editForm.title.trim(),
        basePrice: Number(editForm.basePrice),
        maxGuests: Number(editForm.maxGuests),
        bedType: editForm.bedType.trim(),
        roomSizeSqFt: Number(editForm.roomSizeSqFt),
        description: editForm.description.trim() || undefined,
        amenities: editForm.amenities
      });
      setEditingId('');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room type could not be saved.'));
    } finally {
      setWorkingId('');
    }
  };

  const uploadImages = async (event, roomTypeId) => {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (!files.length) return;
    setUploadingId(roomTypeId);
    setError('');
    try {
      const body = new FormData();
      files.forEach(file => body.append('images', file));
      await api.post(`/uploads/room-types/${roomTypeId}/images`, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room type images could not be uploaded.'));
    } finally {
      setUploadingId('');
    }
  };

  const removeImage = async (roomType, imageUrl) => {
    const approved = await confirm({
      title: 'Remove image',
      message: 'Remove this image from the room type gallery?',
      confirmLabel: 'Remove image'
    });
    if (!approved) return;
    setWorkingId(roomType._id);
    setError('');
    try {
      const currentImages = (roomType.images || []).filter(img => {
        const src = typeof img === 'string' ? img : img.url;
        return src !== imageUrl;
      });
      await api.patch(`/rooms/type/${roomType._id}`, { images: currentImages });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Image could not be removed.'));
    } finally {
      setWorkingId('');
    }
  };

  const formFields = (form, update) => (
    <>
      <label className="dash-field">Room type name
        <input required value={form.title} onChange={event => update(current => ({ ...current, title: event.target.value }))} placeholder="e.g. Single Deluxe, Suite" />
      </label>
      <label className="dash-field">Base price (night)
        <input required type="number" min="0" step="0.01" value={form.basePrice} onChange={event => update(current => ({ ...current, basePrice: event.target.value }))} />
      </label>
      <label className="dash-field">Max guests
        <input required type="number" min="1" step="1" value={form.maxGuests} onChange={event => update(current => ({ ...current, maxGuests: event.target.value }))} />
      </label>
      <label className="dash-field">Bed type
        <input required value={form.bedType} onChange={event => update(current => ({ ...current, bedType: event.target.value }))} placeholder="King, Queen, Twin" />
      </label>
      <label className="dash-field">Room size (sq ft)
        <input required type="number" min="0" step="1" value={form.roomSizeSqFt} onChange={event => update(current => ({ ...current, roomSizeSqFt: event.target.value }))} />
      </label>
      <label className="dash-field dash-field-wide">Description
        <textarea rows="2" value={form.description} onChange={event => update(current => ({ ...current, description: event.target.value }))} />
      </label>
    </>
  );

  return (
    <Panel id="room-types" title="Room types & images" meta={`${roomTypes.length} room types · Manage images per type`}>
      {error && <ErrorState message={error} onRetry={() => { setLoading(true); void load(); }} />}
      <form className="dash-panel-body dash-room-form" onSubmit={createRoomType}>
        <strong>Add a room type</strong>
        <div className="dash-form-grid">{formFields(newRoomType, setNewRoomType)}</div>
        <button className="dash-button" type="submit" disabled={workingId === 'create'}>
          <Plus size={14} />{workingId === 'create' ? 'Adding…' : 'Add room type'}
        </button>
      </form>
      {loading ? <LoadingState label="Loading room types…" /> : (
        <Table
          rows={roomTypes}
          empty="No room types created yet."
          columns={[
            {
              label: 'Room type',
              render: roomType => editingId === roomType._id ? (
                <input value={editForm.title} onChange={event => setEditForm(current => ({ ...current, title: event.target.value }))} />
              ) : (
                <div><strong>{roomType.title}</strong>{roomType.description && <small>{roomType.description}</small>}</div>
              )
            },
            {
              label: 'Rate / Guests',
              render: roomType => editingId === roomType._id ? (
                <div className="dash-form-grid">
                  <input type="number" step="0.01" value={editForm.basePrice} onChange={event => setEditForm(current => ({ ...current, basePrice: event.target.value }))} />
                  <input type="number" step="1" value={editForm.maxGuests} onChange={event => setEditForm(current => ({ ...current, maxGuests: event.target.value }))} />
                </div>
              ) : (
                <span>₹{Number(roomType.basePrice).toLocaleString('en-IN')} / night · {roomType.maxGuests} guests</span>
              )
            },
            {
              label: 'Bed / Size',
              render: roomType => editingId === roomType._id ? (
                <div className="dash-form-grid">
                  <input value={editForm.bedType} onChange={event => setEditForm(current => ({ ...current, bedType: event.target.value }))} />
                  <input type="number" value={editForm.roomSizeSqFt} onChange={event => setEditForm(current => ({ ...current, roomSizeSqFt: event.target.value }))} />
                </div>
              ) : (
                <span>{roomType.bedType} · {roomType.roomSizeSqFt} sq ft</span>
              )
            },
            {
              label: 'Images',
              render: roomType => {
                const images = roomType.images || [];
                return (
                  <div className="dash-roomtype-images">
                    {images.map((img, idx) => {
                      const src = typeof img === 'string' ? img : img.url;
                      return src ? (
                        <div key={`${src}-${idx}`} className="dash-roomtype-thumb">
                          <img src={src} alt={`${roomType.title} ${idx + 1}`} loading="lazy" />
                          <button type="button" className="dash-thumb-remove" onClick={() => removeImage(roomType, src)} disabled={Boolean(workingId)}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : null;
                    })}
                    <input
                      ref={el => (fileInputRefs.current[roomType._id] = el)}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      hidden
                      onChange={event => uploadImages(event, roomType._id)}
                    />
                    <button
                      type="button"
                      className="dash-roomtype-upload"
                      onClick={() => fileInputRefs.current[roomType._id]?.click()}
                      disabled={uploadingId === roomType._id}
                    >
                      <ImagePlus size={14} />
                      {uploadingId === roomType._id ? 'Uploading…' : 'Add images'}
                    </button>
                  </div>
                );
              }
            },
            {
              label: 'Actions',
              render: roomType => editingId === roomType._id ? (
                <div className="dash-toolbar">
                  <button className="dash-button" type="button" disabled={workingId === roomType._id} onClick={() => saveRoomType(roomType._id)}>
                    <Save size={13} />Save
                  </button>
                  <button className="dash-button-secondary" type="button" onClick={() => setEditingId('')}>
                    <X size={13} />Cancel
                  </button>
                </div>
              ) : (
                <div className="dash-toolbar">
                  <button className="dash-button-secondary" type="button" disabled={Boolean(workingId)} onClick={() => startEditing(roomType)}>
                    Edit
                  </button>
                </div>
              )
            }
          ]}
        />
      )}
      <div className="dash-panel-body dash-room-refresh">
        <button className="dash-button-secondary" type="button" disabled={loading} onClick={() => { setLoading(true); void load(); }}>
          <RefreshCw size={13} />Refresh room types
        </button>
      </div>
    </Panel>
  );
};

export default RoomTypeManagement;
