import { useCallback, useEffect, useState } from 'react';
import { KeyRound, ArrowRightLeft, Building2, RefreshCw, ShieldCheck, UserPlus, X } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';
import { useAuth } from '../../Core/AuthHooks';
import { PERMISSIONS, PERMISSION_GROUPS, permissionLabel, rolePermissions } from './permissions';
import { ErrorState, Panel, Status, Table, useConfirm } from './DashboardParts';
import './StaffManagement.css';

const STAFF_ROLES = ['manager', 'receptionist', 'housekeeping'];
const BRAND_WIDE = 'none';
const EMPTY_CREATE_FORM = { name: '', email: '', phone: '', password: '', role: 'receptionist', propertyId: '', customPermissions: [] };

const togglePermission = (list, permission, enabled) => (
  enabled
    ? Array.from(new Set([...list, permission]))
    : list.filter(item => item !== permission)
);

/** Role defaults are shown locked; the rest can be granted as personalised extras. */
const PermissionPicker = ({ role, value, onChange, canGrantPrivileged }) => (
  <div className="staff-permissions">
    {PERMISSION_GROUPS.map(group => (
      <fieldset className="staff-permission-group" key={group.label}>
        <legend>{group.label}</legend>
        {group.items.map(([permission, label]) => {
          const fromRole = rolePermissions(role).includes(permission);
          const locked = fromRole || (permission === PERMISSIONS.USERS_MANAGE_ROLES && !canGrantPrivileged);
          return (
            <label className={`staff-permission${locked ? ' is-locked' : ''}`} key={permission}>
              <input
                type="checkbox"
                checked={fromRole || value.includes(permission)}
                disabled={locked}
                onChange={event => onChange(togglePermission(value, permission, event.target.checked))}
              />
              <span>
                {label}
                {fromRole && <em>role default</em>}
              </span>
            </label>
          );
        })}
      </fieldset>
    ))}
  </div>
);

const extraPermissionsOf = member => (member.customPermissions || [])
  .filter(permission => !rolePermissions(member.role).includes(permission));

/**
 * Full staff CRUD surface (create / read / update / delete).
 * Used directly by the admin dashboard and surfaced to any staff member who has been
 * granted staff permissions through the permission-aware tools section.
 */
const StaffManagement = ({ staff, onChanged }) => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const controlled = Array.isArray(staff);
  const canGrantPrivileged = user?.role === 'admin';

  const [localMembers, setLocalMembers] = useState([]);
  const [loading, setLoading] = useState(!controlled);
  const [loadError, setLoadError] = useState('');
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [working, setWorking] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const members = controlled ? staff : localMembers;

  // Branch list is a public endpoint, so it loads for every staff member that can reach this panel.
  useEffect(() => {
    let active = true;
    api.get('/properties/locations')
      .then(({ data }) => { if (active) setBranches(data.locations || []); })
      .catch(() => { if (active) setBranches([]); });
    return () => { active = false; };
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await api.get('/users/staff');
      setLocalMembers(data.staff || []);
      setLoadError('');
    } catch (requestError) {
      setLoadError(getApiErrorMessage(requestError, 'Staff records could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (controlled) {
      onChanged?.();
      return;
    }
    setLoading(true);
    await fetchMembers();
  }, [controlled, onChanged, fetchMembers]);

  useEffect(() => {
    if (!controlled) void fetchMembers();
  }, [controlled, fetchMembers]);

  const createStaff = async event => {
    event.preventDefault();
    setWorking(true);
    setFormError('');
    setNotice('');
    try {
      await api.post('/users/staff', { ...createForm, propertyId: createForm.propertyId || null });
      setNotice(`Staff account created for ${createForm.email}.`);
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreate(false);
      await reload();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Staff account could not be created.'));
    } finally {
      setWorking(false);
    }
  };

  const saveAccess = async () => {
    if (!editing) return;
    setWorking(true);
    setFormError('');
    setNotice('');
    try {
      await api.put(`/users/staff/${editing._id}`, {
        role: editing.role,
        accountStatus: editing.accountStatus,
        name: editing.name,
        phone: editing.phone,
        customPermissions: editing.customPermissions
      });
      setNotice(`Access updated for ${editing.name}.`);
      setEditing(null);
      await reload();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Staff access could not be updated.'));
    } finally {
      setWorking(false);
    }
  };

  const transferBranch = async () => {
    if (!editing || !transferTarget) return;
    setWorking(true);
    setFormError('');
    setNotice('');
    try {
      const { data } = await api.patch(`/users/staff/${editing._id}/branch`, {
        propertyId: transferTarget === BRAND_WIDE ? null : transferTarget
      });
      setNotice(data.message || `${editing.name} was moved to a new branch.`);
      setEditing(null);
      setTransferTarget('');
      await reload();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Branch transfer could not be completed.'));
    } finally {
      setWorking(false);
    }
  };

  const toggleStatus = async member => {    const accountStatus = member.accountStatus === 'active' ? 'deactivated' : 'active';
    setWorking(true);
    setFormError('');
    setNotice('');
    try {
      await api.patch(`/users/staff/${member._id}/status`, { accountStatus });
      setNotice(`${member.name} is now ${accountStatus}.`);
      await reload();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Staff status could not be changed.'));
    } finally {
      setWorking(false);
    }
  };

  const removeStaff = async member => {
    const confirmed = await confirm({
      title: 'Delete staff account',
      message: `Permanently remove ${member.name} (${member.email})? Their active sessions are revoked and this cannot be undone.`,
      confirmLabel: 'Delete account'
    });
    if (!confirmed) return;
    setWorking(true);
    setFormError('');
    setNotice('');
    try {
      await api.delete(`/users/staff/${member._id}`);
      setNotice(`${member.name} was removed.`);
      setEditing(null);
      await reload();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Staff account could not be deleted.'));
    } finally {
      setWorking(false);
    }
  };

  const openEditor = member => {
    setFormError('');
    setTransferTarget('');
    setEditing({
      _id: member._id,
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      accountStatus: member.accountStatus,
      propertyId: member.propertyId ? String(member.propertyId) : '',
      branch: member.branch || null,
      customPermissions: member.customPermissions || []
    });
  };

  const visibleMembers = branchFilter
    ? members.filter(member => (branchFilter === BRAND_WIDE
      ? !member.propertyId
      : String(member.propertyId) === branchFilter))
    : members;

  const columns = [
    {
      label: 'Team member',
      sortValue: member => member.name,
      render: member => (
        <div className="staff-identity">
          <strong>{member.name}</strong>
          <span>{member.email}</span>
        </div>
      )
    },
    { label: 'Role', key: 'role', render: member => <Status value={member.role} /> },
    {
      label: 'Branch',
      sortValue: member => member.branch?.propertyName || '',
      render: member => (member.branch
        ? <span className="staff-branch-tag"><Building2 size={11} /> {member.branch.propertyName}</span>
        : <span className="staff-muted">Brand-wide</span>)
    },
    { label: 'Account', key: 'accountStatus', render: member => <Status value={member.accountStatus} /> },
    {
      label: 'Extra access',
      sortValue: member => extraPermissionsOf(member).length,
      render: member => {
        const extras = extraPermissionsOf(member);
        if (extras.length === 0) return <span className="staff-muted">Role defaults only</span>;
        return (
          <div className="staff-badges">
            {extras.slice(0, 2).map(permission => <span className="staff-badge" key={permission}>{permissionLabel(permission)}</span>)}
            {extras.length > 2 && <span className="staff-badge staff-badge--more">+{extras.length - 2}</span>}
          </div>
        );
      }
    },
    {
      label: 'Manage',
      render: member => (
        <button className="dash-button-secondary" type="button" onClick={() => openEditor(member)}>
          <KeyRound size={13} /> Manage
        </button>
      )
    }
  ];

  return (
    <>
      <Panel
        id="staff"
        title="Staff & access"
        meta={`${members.length} account${members.length === 1 ? '' : 's'}`}
        action={(
          <button className="dash-button-secondary" type="button" onClick={() => { setShowCreate(current => !current); setFormError(''); }}>
            <UserPlus size={14} /> {showCreate ? 'Close form' : 'Add staff'}
          </button>
        )}
        loading={!controlled && loading}
      >
        {showCreate && (
          <form className="dash-panel-body dash-stack staff-create" onSubmit={createStaff}>
            <div className="dash-form-grid">
              <label className="dash-field">Name<input required value={createForm.name} onChange={event => setCreateForm({ ...createForm, name: event.target.value })} /></label>
              <label className="dash-field">Email<input type="email" required value={createForm.email} onChange={event => setCreateForm({ ...createForm, email: event.target.value })} /></label>
              <label className="dash-field">Phone<input value={createForm.phone} onChange={event => setCreateForm({ ...createForm, phone: event.target.value })} /></label>
              <label className="dash-field">Temporary password<input type="password" required minLength={8} value={createForm.password} onChange={event => setCreateForm({ ...createForm, password: event.target.value })} /></label>
              <label className="dash-field">Role
                <select value={createForm.role} onChange={event => setCreateForm({ ...createForm, role: event.target.value })}>
                  {STAFF_ROLES.map(role => <option key={role} value={role}>{role.replace(/^\w/, letter => letter.toUpperCase())}</option>)}
                </select>
              </label>
              <label className="dash-field">Home branch
                <select value={createForm.propertyId} onChange={event => setCreateForm({ ...createForm, propertyId: event.target.value })}>
                  <option value="">Brand-wide (all branches)</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>{branch.propertyName} ({branch.propertyCode})</option>
                  ))}
                </select>
              </label>
            </div>
            <details className="staff-permission-disclosure">
              <summary><ShieldCheck size={13} /> Extra permissions ({createForm.customPermissions.length} selected)</summary>
              <PermissionPicker
                role={createForm.role}
                value={createForm.customPermissions}
                onChange={customPermissions => setCreateForm({ ...createForm, customPermissions })}
                canGrantPrivileged={canGrantPrivileged}
              />
            </details>
            {formError && <ErrorState message={formError} />}
            <button className="dash-button" type="submit" disabled={working}>
              <UserPlus size={14} /> {working ? 'Creating…' : 'Create staff account'}
            </button>
          </form>
        )}
        {!showCreate && formError && <div className="dash-panel-body"><ErrorState message={formError} /></div>}
        {notice && <div className="dash-panel-body"><p className="staff-notice" role="status">{notice}</p></div>}
        {branches.length > 0 && (
          <div className="dash-panel-body staff-filter">
            <label className="dash-field">Branch filter
              <select value={branchFilter} onChange={event => setBranchFilter(event.target.value)}>
                <option value="">All branches</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.propertyName} ({branch.propertyCode})</option>
                ))}
                <option value={BRAND_WIDE}>Unassigned (brand-wide)</option>
              </select>
            </label>
            {branchFilter && <span className="staff-muted">{visibleMembers.length} of {members.length} shown</span>}
          </div>
        )}
        {!controlled && loadError ? (
          <div className="dash-panel-body"><ErrorState message={loadError} onRetry={reload} /></div>
        ) : (
          <Table
            rows={visibleMembers}
            empty={loading ? 'Loading staff records…' : 'No staff accounts match this branch.'}
            searchPlaceholder="Search staff by name, email, branch or permission…"
            columns={columns}
          />
        )}
        <p className="dash-panel-body staff-hint">Assign a home branch or use Manage → Transfer to move a staff member between LuxuryStay branches. Grant extra permissions to unlock matching tools on that staff member&apos;s own dashboard.</p>
      </Panel>

      {editing && (
        <div className="staff-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setEditing(null); }}>
          <div className="staff-modal" role="dialog" aria-modal="true" aria-label={`Manage access for ${editing.name}`}>
            <header className="staff-modal-head">
              <div>
                <span className="staff-modal-eyebrow">Access control</span>
                <h3>{editing.name}</h3>
                <p>{editing.email}</p>
              </div>
              <button className="staff-modal-close" type="button" aria-label="Close" onClick={() => setEditing(null)}><X size={16} /></button>
            </header>

            <div className="staff-modal-body">
              <div className="dash-form-grid">
                <label className="dash-field">Name<input value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} /></label>
                <label className="dash-field">Phone<input value={editing.phone} onChange={event => setEditing({ ...editing, phone: event.target.value })} /></label>
                <label className="dash-field">Role
                  <select value={editing.role} onChange={event => setEditing({ ...editing, role: event.target.value })}>
                    {STAFF_ROLES.map(role => <option key={role} value={role}>{role.replace(/^\w/, letter => letter.toUpperCase())}</option>)}
                  </select>
                </label>
                <label className="dash-field">Account
                  <select value={editing.accountStatus} onChange={event => setEditing({ ...editing, accountStatus: event.target.value })}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </label>
              </div>

              <div className="staff-branch-block">
                <div className="staff-branch-current">
                  <span className="staff-modal-eyebrow">Home branch</span>
                  <strong>
                    <Building2 size={13} />
                    {editing.branch?.propertyName || 'Unassigned (brand-wide)'}
                  </strong>
                  {editing.branch?.propertyCode && <small>{editing.branch.propertyCode}</small>}
                </div>
                <div className="staff-branch-transfer">
                  <label className="dash-field">Transfer to branch
                    <select value={transferTarget} onChange={event => setTransferTarget(event.target.value)}>
                      <option value="">Select a branch…</option>
                      {branches
                        .filter(branch => String(branch._id) !== String(editing.propertyId || ''))
                        .map(branch => (
                          <option key={branch._id} value={branch._id}>{branch.propertyName} ({branch.propertyCode})</option>
                        ))}
                      {editing.propertyId && <option value={BRAND_WIDE}>Unassign (brand-wide)</option>}
                    </select>
                  </label>
                  <button className="dash-button-secondary" type="button" disabled={working || !transferTarget} onClick={transferBranch}>
                    <ArrowRightLeft size={13} /> Transfer
                  </button>
                </div>
              </div>

              <h4 className="staff-modal-subhead">Permissions</h4>
              <PermissionPicker
                role={editing.role}
                value={editing.customPermissions}
                onChange={customPermissions => setEditing({ ...editing, customPermissions })}
                canGrantPrivileged={canGrantPrivileged}
              />

              {formError && <ErrorState message={formError} />}
            </div>

            <footer className="staff-modal-foot">
              <div className="staff-modal-foot-left">
                <button className="dash-button-secondary" type="button" disabled={working || editing._id === (user?.id || user?._id)} onClick={() => toggleStatus(editing)}>
                  <RefreshCw size={13} /> {editing.accountStatus === 'active' ? 'Deactivate' : 'Reactivate'}
                </button>
                <button className="dash-button-danger" type="button" disabled={working || editing._id === (user?.id || user?._id)} onClick={() => removeStaff(editing)}>Delete</button>
              </div>
              <div className="staff-modal-foot-right">
                <button className="dash-button-secondary" type="button" disabled={working} onClick={() => setEditing(null)}>Cancel</button>
                <button className="dash-button" type="button" disabled={working} onClick={saveAccess}>{working ? 'Saving…' : 'Save changes'}</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffManagement;
