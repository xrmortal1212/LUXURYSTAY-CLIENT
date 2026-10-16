/**
 * Client-side mirror of Server/Config/permissions.js.
 * Keep both files in sync whenever a permission is added or a role's defaults change.
 */

export const PERMISSIONS = {
  // User Management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DEACTIVATE: 'users:deactivate',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage-roles',

  // Room Management
  ROOMS_VIEW: 'rooms:view',
  ROOMS_CREATE: 'rooms:create',
  ROOMS_EDIT: 'rooms:edit',
  ROOMS_DELETE: 'rooms:delete',

  // Booking Engine
  BOOKINGS_VIEW: 'bookings:view',
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_EDIT: 'bookings:edit',
  BOOKINGS_CANCEL: 'bookings:cancel',
  PRICING_CALCULATE: 'pricing:calculate',
  PRICING_MANAGE: 'pricing:manage',
  ANALYTICS_VIEW: 'analytics:view',
  FEEDBACK_MANAGE: 'feedback:manage',
  AI_SENTIMENT_ANALYZE: 'ai:sentiment:analyze',
  AI_HOUSEKEEPING_SCHEDULE: 'ai:housekeeping:schedule',
  SYSTEM_SETTINGS_MANAGE: 'systemSettings:manage',
  SERVICES_MANAGE: 'services:manage',
  HOUSEKEEPING_MANAGE: 'housekeeping:manage',
  MAINTENANCE_VIEW: 'maintenance:view',
  MAINTENANCE_ASSIGN: 'maintenance:assign',
  MAINTENANCE_MANAGE: 'maintenance:manage',

  // Billing & Financials
  BILLING_VIEW: 'billing:view',
  BILLING_CHARGE: 'billing:charge',
  BILLING_GENERATE: 'billing:generate',
  BILLING_EMAIL: 'billing:email',
  BILLING_PAY: 'billing:pay',
  BILLING_REFUND: 'billing:refund',

  // Administrative Reporting & Promotions
  AUDIT_LOGS_VIEW: 'auditLogs:view',
  COUPONS_MANAGE: 'coupons:manage',
  HOTELS_MANAGE: 'hotels:manage',
  LOYALTY_VIEW: 'loyalty:view',
  LOYALTY_REDEEM: 'loyalty:redeem'
};

export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DEACTIVATE, PERMISSIONS.USERS_DELETE,
    PERMISSIONS.ROOMS_VIEW, PERMISSIONS.ROOMS_CREATE, PERMISSIONS.ROOMS_EDIT, PERMISSIONS.ROOMS_DELETE,
    PERMISSIONS.BOOKINGS_VIEW, PERMISSIONS.BOOKINGS_CREATE, PERMISSIONS.BOOKINGS_EDIT, PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.PRICING_CALCULATE,
    PERMISSIONS.PRICING_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.FEEDBACK_MANAGE, PERMISSIONS.AI_SENTIMENT_ANALYZE, PERMISSIONS.AI_HOUSEKEEPING_SCHEDULE,
    PERMISSIONS.SYSTEM_SETTINGS_MANAGE, PERMISSIONS.SERVICES_MANAGE,
    PERMISSIONS.HOUSEKEEPING_MANAGE, PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_ASSIGN, PERMISSIONS.MAINTENANCE_MANAGE,
    PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_CHARGE, PERMISSIONS.BILLING_GENERATE, PERMISSIONS.BILLING_EMAIL, PERMISSIONS.BILLING_PAY, PERMISSIONS.BILLING_REFUND,
    PERMISSIONS.AUDIT_LOGS_VIEW, PERMISSIONS.COUPONS_MANAGE, PERMISSIONS.HOTELS_MANAGE, PERMISSIONS.LOYALTY_VIEW
  ],
  receptionist: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ROOMS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW, PERMISSIONS.BOOKINGS_CREATE, PERMISSIONS.BOOKINGS_EDIT, PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_CHARGE, PERMISSIONS.BILLING_GENERATE, PERMISSIONS.BILLING_EMAIL, PERMISSIONS.BILLING_PAY, PERMISSIONS.SERVICES_MANAGE,
    PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_ASSIGN
  ],
  housekeeping: [
    PERMISSIONS.ROOMS_VIEW, PERMISSIONS.AI_HOUSEKEEPING_SCHEDULE, PERMISSIONS.SERVICES_MANAGE,
    PERMISSIONS.HOUSEKEEPING_MANAGE, PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_MANAGE
  ],
  guest: [
    PERMISSIONS.BOOKINGS_VIEW, PERMISSIONS.BOOKINGS_CREATE, PERMISSIONS.BOOKINGS_EDIT, PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.PRICING_CALCULATE,
    PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_EMAIL, PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.LOYALTY_VIEW, PERMISSIONS.LOYALTY_REDEEM
  ]
};

/** Human-readable labels + grouped ordering used by the staff access editor. */
export const PERMISSION_GROUPS = [
  {
    label: 'Staff & guests',
    items: [
      [PERMISSIONS.USERS_VIEW, 'View staff and guest records'],
      [PERMISSIONS.USERS_CREATE, 'Create staff accounts'],
      [PERMISSIONS.USERS_EDIT, 'Edit staff profiles'],
      [PERMISSIONS.USERS_DEACTIVATE, 'Suspend or reactivate accounts'],
      [PERMISSIONS.USERS_DELETE, 'Delete staff accounts'],
      [PERMISSIONS.USERS_MANAGE_ROLES, 'Change roles & grant permissions']
    ]
  },
  {
    label: 'Rooms',
    items: [
      [PERMISSIONS.ROOMS_VIEW, 'View rooms and room types'],
      [PERMISSIONS.ROOMS_CREATE, 'Add rooms and room types'],
      [PERMISSIONS.ROOMS_EDIT, 'Edit rooms and room types'],
      [PERMISSIONS.ROOMS_DELETE, 'Delete rooms and room types']
    ]
  },
  {
    label: 'Bookings & pricing',
    items: [
      [PERMISSIONS.BOOKINGS_VIEW, 'View reservations'],
      [PERMISSIONS.BOOKINGS_CREATE, 'Create reservations'],
      [PERMISSIONS.BOOKINGS_EDIT, 'Modify reservations'],
      [PERMISSIONS.BOOKINGS_CANCEL, 'Cancel reservations'],
      [PERMISSIONS.PRICING_CALCULATE, 'Calculate live pricing'],
      [PERMISSIONS.PRICING_MANAGE, 'Manage dynamic pricing rules']
    ]
  },
  {
    label: 'Operations',
    items: [
      [PERMISSIONS.HOUSEKEEPING_MANAGE, 'Manage housekeeping tasks'],
      [PERMISSIONS.SERVICES_MANAGE, 'Handle guest service requests'],
      [PERMISSIONS.MAINTENANCE_VIEW, 'View maintenance issues'],
      [PERMISSIONS.MAINTENANCE_ASSIGN, 'Assign maintenance work'],
      [PERMISSIONS.MAINTENANCE_MANAGE, 'Resolve maintenance issues']
    ]
  },
  {
    label: 'Billing & finance',
    items: [
      [PERMISSIONS.BILLING_VIEW, 'View invoices and balances'],
      [PERMISSIONS.BILLING_CHARGE, 'Add charges to a bill'],
      [PERMISSIONS.BILLING_GENERATE, 'Generate invoices'],
      [PERMISSIONS.BILLING_EMAIL, 'Email invoices'],
      [PERMISSIONS.BILLING_PAY, 'Record payments'],
      [PERMISSIONS.BILLING_REFUND, 'Issue refunds']
    ]
  },
  {
    label: 'Insights & administration',
    items: [
      [PERMISSIONS.ANALYTICS_VIEW, 'View analytics reports'],
      [PERMISSIONS.FEEDBACK_MANAGE, 'Manage guest feedback'],
      [PERMISSIONS.AI_SENTIMENT_ANALYZE, 'Run AI sentiment analysis'],
      [PERMISSIONS.AI_HOUSEKEEPING_SCHEDULE, 'Run AI housekeeping scheduling'],
      [PERMISSIONS.COUPONS_MANAGE, 'Manage coupons'],
      [PERMISSIONS.HOTELS_MANAGE, 'Manage hotels & properties'],
      [PERMISSIONS.SYSTEM_SETTINGS_MANAGE, 'Manage system settings'],
      [PERMISSIONS.AUDIT_LOGS_VIEW, 'View audit logs'],
      [PERMISSIONS.LOYALTY_VIEW, 'View loyalty programme'],
      [PERMISSIONS.LOYALTY_REDEEM, 'Redeem loyalty points']
    ]
  }
];

const PERMISSION_LABELS = new Map(
  PERMISSION_GROUPS.flatMap(group => group.items)
);

/** Permissions granted by a role, before any personalised extras. */
export const rolePermissions = role => ROLE_PERMISSIONS[role] || [];

/** Role defaults plus any per-user custom permissions (the authoritative effective set). */
export const effectivePermissions = user => {
  if (!user) return [];
  const roleDefaults = rolePermissions(user.role);
  const extras = Array.isArray(user.customPermissions) ? user.customPermissions : [];
  return Array.from(new Set([...roleDefaults, ...extras]));
};

export const permissionLabel = permission => PERMISSION_LABELS.get(permission) || permission;
