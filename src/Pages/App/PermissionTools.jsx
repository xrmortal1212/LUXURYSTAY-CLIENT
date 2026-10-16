import { Wrench } from 'lucide-react';
import { PERMISSIONS } from './permissions';
import { usePermissions } from './usePermissions';
import { Panel } from './DashboardParts';
import StaffManagement from './StaffManagement';
import RoomManagement from './RoomManagement';
import ReservationTools from './ReservationTools';
import AdministrationTools from './Dashboards/AdministrationTools';
import './PermissionTools.css';

/**
 * Registry of dashboard tools that unlock when a staff member is granted the
 * matching permission. `anyOf` is the trigger, `allOf` lists prerequisites.
 */
const TOOL_REGISTRY = [
  {
    key: 'staff',
    label: 'Staff accounts (create, edit, remove)',
    description: 'Add team members, change roles, grant extra permissions and delete accounts.',
    anyOf: [PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_DEACTIVATE, PERMISSIONS.USERS_DELETE, PERMISSIONS.USERS_MANAGE_ROLES],
    allOf: [],
    render: () => <StaffManagement />
  },
  {
    key: 'rooms',
    label: 'Room & room-type management',
    description: 'Create rooms, edit rates and manage gallery images.',
    anyOf: [PERMISSIONS.ROOMS_CREATE, PERMISSIONS.ROOMS_EDIT, PERMISSIONS.ROOMS_DELETE],
    allOf: [PERMISSIONS.ROOMS_VIEW],
    render: () => <RoomManagement />
  },
  {
    key: 'reservations',
    label: 'Reservation desk',
    description: 'Search live availability and create or amend guest reservations.',
    anyOf: [PERMISSIONS.BOOKINGS_CREATE],
    allOf: [],
    render: () => <ReservationTools />
  },
  {
    key: 'administration',
    label: 'Property administration',
    description: 'Manage hotels, coupons and dynamic pricing rules.',
    anyOf: [PERMISSIONS.HOTELS_MANAGE],
    allOf: [PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.PRICING_MANAGE],
    render: () => <AdministrationTools />
  }
];

/**
 * Renders the tools a staff member can reach thanks to extra permissions.
 * Dashboards pass `exclude` for tools they already render themselves so panels
 * (and their anchor ids) are never duplicated.
 */
const PermissionTools = ({ user, exclude = [] }) => {
  const { can, canAny } = usePermissions(user);

  const unlocked = TOOL_REGISTRY.filter(tool => {
    if (exclude.includes(tool.key)) return false;
    if (tool.allOf.length > 0 && !tool.allOf.every(permission => can(permission))) return false;
    return canAny(tool.anyOf);
  });

  if (unlocked.length === 0) return null;

  return (
    <>
      <Panel
        id="my-tools"
        title="Extra access tools"
        meta={`${unlocked.length} unlocked by your permissions`}
      >
        <div className="dash-panel-body">
          <ul className="perm-tool-list">
            {unlocked.map(tool => (
              <li key={tool.key}>
                <span className="perm-tool-icon" aria-hidden="true"><Wrench size={14} /></span>
                <div className="perm-tool-copy">
                  <strong>{tool.label}</strong>
                  <span>{tool.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {unlocked.map(tool => (
        <div className="perm-tool-slot" key={tool.key}>{tool.render()}</div>
      ))}
    </>
  );
};

export default PermissionTools;
