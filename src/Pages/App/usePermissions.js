import { useCallback, useMemo } from 'react';
import { effectivePermissions } from './permissions';

/**
 * Resolves the signed-in user's effective permissions (role defaults + custom grants)
 * and exposes a `can(permission)` helper for permission-aware dashboards.
 */
export const usePermissions = (user) => {
  const permissions = useMemo(() => effectivePermissions(user), [user]);

  const can = useCallback(
    permission => permissions.includes(permission),
    [permissions]
  );

  const canAny = useCallback(
    candidates => candidates.some(permission => permissions.includes(permission)),
    [permissions]
  );

  return { permissions, can, canAny };
};
