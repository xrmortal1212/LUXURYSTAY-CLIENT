import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Camera, Check, ImagePlus, LoaderCircle, MapPin, RotateCcw, Save, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '../../Config/api';
import { useAuth } from '../../Core/AuthHooks';
import MapAddressPicker from './MapAddressPicker';
import './Styles/Profile.css';

const emptyDetails = {
  address: { street: '', city: '', state: '', zipCode: '', country: '' },
  emergencyContact: { name: '', relationship: '', phone: '' },
  preferences: { roomType: '', dietary: '', specialRequests: '' }
};

const getProfileForm = user => ({
  name: user?.name || '',
  phone: user?.phone || '',
  address: { ...emptyDetails.address, ...user?.address },
  emergencyContact: { ...emptyDetails.emergencyContact, ...user?.emergencyContact },
  preferences: { ...emptyDetails.preferences, ...user?.preferences }
});

const ProfileField = ({ label, name, value, onChange, group, type = 'text', placeholder = '' }) => (
  <label className="ls-profile-field">
    <span>{label}</span>
    <input
      className="ls-profile-input"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      data-group={group}
      placeholder={placeholder}
    />
  </label>
);

function Profile() {
  const { user, isLoading, updateUser } = useAuth();
  if (isLoading) {
    return <main className="ls-profile-page"><div className="ls-profile-shell ls-profile-loading">Loading your profile…</div></main>;
  }

  if (!user) {
    return (
      <main className="ls-profile-page">
        <section className="ls-profile-shell ls-profile-signin">
          <span className="ls-profile-eyebrow">YOUR LUXURYSTAY ACCOUNT</span>
          <h1>Sign in to view your profile</h1>
          <p>Your profile details and preferences are available after you sign in.</p>
          <Link className="ls-profile-save" to="/login"><UserRound size={17} /> Sign in</Link>
        </section>
      </main>
    );
  }

  return <ProfileEditor key={user._id} user={user} updateUser={updateUser} />;
}

function ProfileEditor({ user, updateUser }) {
  const [form, setForm] = useState(() => getProfileForm(user));
  const [savedForm, setSavedForm] = useState(() => getProfileForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  const avatarInput = useRef(null);
  const bannerInput = useRef(null);
  const hasChanges = JSON.stringify(form) !== JSON.stringify(savedForm);
  const profileChecklist = [
    Boolean(user.name?.trim()),
    Boolean(user.phone?.trim()),
    Boolean(user.profilePicture),
    Boolean(user.address?.city?.trim()),
    Boolean(user.preferences?.roomType?.trim())
  ];
  const completion = Math.round(profileChecklist.filter(Boolean).length / profileChecklist.length * 100);

  const handleFieldChange = event => {
    const { name, value, dataset } = event.currentTarget;
    if (dataset.group) {
      setForm(current => ({
        ...current,
        [dataset.group]: { ...current[dataset.group], [name]: value }
      }));
      return;
    }
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleAddressChange = updates => {
    setForm(current => ({ ...current, address: { ...current.address, ...updates } }));
  };

  const saveProfile = async event => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError('Please enter your name.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const { data } = await api.put('/users/profile', {
        ...form,
        name,
        phone: form.phone.trim()
      });
      setForm(getProfileForm(data.user));
      setSavedForm(getProfileForm(data.user));
      updateUser(data.user);
      toast.success('Your profile has been updated.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Your profile could not be updated.'));
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (event, imageType) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!acceptedTypes.includes(file.type)) {
      setError('Choose a JPEG, PNG, WebP, or AVIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.');
      return;
    }

    setUploading(imageType);
    setError('');
    const body = new FormData();
    body.append('image', file);

    try {
      const endpoint = imageType === 'avatar' ? '/uploads/profile/avatar' : '/uploads/profile/banner';
      const { data } = await api.post(endpoint, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(data.user);
      toast.success(imageType === 'avatar' ? 'Profile picture updated.' : 'Profile banner updated.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'The image could not be uploaded.'));
    } finally {
      setUploading('');
    }
  };

  const displayName = user.name || 'LuxuryStay guest';
  const role = (user.role || 'guest').replace(/_/g, ' ');

  return (
    <main className="ls-profile-page">
      <div className="ls-profile-shell">
        <header className="ls-profile-intro">
          <span className="ls-profile-eyebrow">YOUR LUXURYSTAY ACCOUNT</span>
          <h1>Your profile</h1>
          <p>Keep your details up to date for a more personal stay.</p>
        </header>

        <section className="ls-profile-progress" aria-label={`Profile ${completion}% complete`}>
          <div className="ls-profile-progress-copy">
            <span className="ls-profile-progress-icon"><Check size={16} /></span>
            <div><strong>Make yourself at home</strong><p>Add a few details to personalise your stay.</p></div>
            <strong className="ls-profile-progress-value">{completion}%</strong>
          </div>
          <div className="ls-profile-progress-track" role="progressbar" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100">
            <span style={{ width: `${completion}%` }} />
          </div>
          <nav className="ls-profile-quick-nav" aria-label="Profile sections">
            <a href="#personal-details">Personal details</a>
            <a href="#profile-address">Address</a>
            <a href="#stay-preferences">Stay preferences</a>
            <a href="#emergency-contact">Emergency contact</a>
          </nav>
        </section>

        <section className="ls-profile-card" aria-label="Profile overview">
          <div className="ls-profile-cover">
            {user.profileBanner && <img src={user.profileBanner} alt="" />}
            <div className="ls-profile-cover-shade" />
            <input
              ref={bannerInput}
              className="ls-profile-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              aria-label="Choose a profile banner"
              onChange={event => uploadImage(event, 'banner')}
            />
            <button
              className="ls-profile-cover-button"
              type="button"
              onClick={() => bannerInput.current?.click()}
              disabled={uploading === 'banner'}
            >
              {uploading === 'banner' ? <LoaderCircle size={16} className="ls-profile-spin" /> : <ImagePlus size={16} />}
              {uploading === 'banner' ? 'Uploading…' : user.profileBanner ? 'Change cover' : 'Add a cover'}
            </button>
          </div>

          <div className="ls-profile-identity">
            <div className="ls-profile-avatar-wrap">
              <div className="ls-profile-avatar">
                {user.profilePicture
                  ? <img src={user.profilePicture} alt={`${displayName}'s profile`} />
                  : <span>{displayName.slice(0, 1).toUpperCase()}</span>}
              </div>
              <input
                ref={avatarInput}
                className="ls-profile-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                aria-label="Choose a profile picture"
                onChange={event => uploadImage(event, 'avatar')}
              />
              <button
                className="ls-profile-avatar-button"
                type="button"
                aria-label="Change profile picture"
                onClick={() => avatarInput.current?.click()}
                disabled={uploading === 'avatar'}
              >
                {uploading === 'avatar' ? <LoaderCircle size={15} className="ls-profile-spin" /> : <Camera size={15} />}
              </button>
            </div>
            <div className="ls-profile-person">
              <div className="ls-profile-name-row">
                <h2>{displayName}</h2>
                {user.isEmailVerified && <BadgeCheck size={19} aria-label="Verified email" />}
              </div>
              <p>{user.email}</p>
              <span className="ls-profile-role">{role}</span>
            </div>
            <div className="ls-profile-location">
              <MapPin size={16} />
              <span>{user.address?.city || 'Your next stay starts here'}</span>
            </div>
          </div>
        </section>

        <form className="ls-profile-form" onSubmit={saveProfile}>
          <section className="ls-profile-panel" id="personal-details">
            <div className="ls-profile-section-heading">
              <div><span>01</span><h2>Personal details</h2></div>
              <p>How we can reach you</p>
            </div>
            <div className="ls-profile-fields">
              <ProfileField label="Full name" name="name" value={form.name} onChange={handleFieldChange} placeholder="Your full name" />
              <label className="ls-profile-field">
                <span>Email address</span>
                <input className="ls-profile-input ls-profile-readonly" type="email" value={user.email || ''} readOnly />
                <small>Email address cannot be changed here.</small>
              </label>
              <ProfileField label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleFieldChange} placeholder="Your phone number" />
            </div>
          </section>

          <section className="ls-profile-panel" id="profile-address">
            <div className="ls-profile-section-heading">
              <div><span>02</span><h2>Address</h2></div>
              <p>Search an address, use your location, or drop a pin</p>
            </div>
            <MapAddressPicker address={form.address} onAddressChange={handleAddressChange} />
          </section>

          <section className="ls-profile-panel" id="stay-preferences">
            <div className="ls-profile-section-heading">
              <div><span>03</span><h2>Stay preferences</h2></div>
              <p>Let us know what makes your stay comfortable</p>
            </div>
            <div className="ls-profile-fields">
              <ProfileField label="Preferred room type" name="roomType" group="preferences" value={form.preferences.roomType} onChange={handleFieldChange} placeholder="e.g. Suite, ocean view" />
              <ProfileField label="Dietary preferences" name="dietary" group="preferences" value={form.preferences.dietary} onChange={handleFieldChange} placeholder="e.g. Vegetarian" />
              <label className="ls-profile-field ls-profile-field-wide">
                <span>Special requests</span>
                <textarea className="ls-profile-input ls-profile-textarea" name="specialRequests" value={form.preferences.specialRequests} onChange={handleFieldChange} data-group="preferences" placeholder="Anything else we should know?" rows={3} />
              </label>
            </div>
          </section>

          <section className="ls-profile-panel" id="emergency-contact">
            <div className="ls-profile-section-heading">
              <div><span>04</span><h2>Emergency contact</h2></div>
              <p>Optional contact for your peace of mind</p>
            </div>
            <div className="ls-profile-fields">
              <ProfileField label="Contact name" name="name" group="emergencyContact" value={form.emergencyContact.name} onChange={handleFieldChange} placeholder="Full name" />
              <ProfileField label="Relationship" name="relationship" group="emergencyContact" value={form.emergencyContact.relationship} onChange={handleFieldChange} placeholder="e.g. Partner, family" />
              <ProfileField label="Phone number" name="phone" type="tel" group="emergencyContact" value={form.emergencyContact.phone} onChange={handleFieldChange} placeholder="Contact phone number" />
            </div>
          </section>

          {error && <p className="ls-profile-error" role="alert">{error}</p>}
          <div className="ls-profile-form-footer">
            <p className={hasChanges ? 'ls-profile-dirty' : ''}>
              {hasChanges ? 'You have unsaved changes.' : 'Your profile is up to date.'}
            </p>
            <div className="ls-profile-form-actions">
              {hasChanges && <button
                className="ls-profile-reset"
                type="button"
                onClick={() => { setForm(savedForm); setError(''); }}
                disabled={isSaving || Boolean(uploading)}
              >
                <RotateCcw size={15} /> Discard
              </button>}
              <button className="ls-profile-save" type="submit" disabled={!hasChanges || isSaving || Boolean(uploading)}>
                {isSaving ? <LoaderCircle size={17} className="ls-profile-spin" /> : <Save size={17} />}
                {isSaving ? 'Saving changes…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Profile;
