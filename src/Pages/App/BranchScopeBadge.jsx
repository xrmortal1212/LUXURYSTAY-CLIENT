import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { api } from '../../Config/api';

// Active branches are public and stable for a session, so resolve them once.
let branchCache = null;
const loadBranches = () => {
  if (!branchCache) {
    branchCache = api.get('/properties/locations')
      .then(({ data }) => data.locations || [])
      .catch(() => []);
  }
  return branchCache;
};

const BranchScopeBadge = ({ user }) => {
  const [branches, setBranches] = useState([]);
  const propertyId = user?.propertyId || null;

  useEffect(() => {
    let active = true;
    loadBranches().then(locations => { if (active) setBranches(locations); });
    return () => { active = false; };
  }, []);

  const branch = propertyId ? branches.find(item => String(item._id) === String(propertyId)) : null;
  const label = propertyId ? (branch?.propertyName || 'Assigned branch') : 'All branches';
  const scopeNote = propertyId
    ? 'Your account only sees data for this branch.'
    : 'Your account can see data for every branch.';

  return (
    <span className="dash-branch-chip" title={scopeNote}>
      <Building2 size={13} aria-hidden="true" />
      <span className="dash-branch-chip-label">{propertyId ? 'Branch' : 'Scope'}</span>
      <strong>{label}</strong>
    </span>
  );
};

export default BranchScopeBadge;
