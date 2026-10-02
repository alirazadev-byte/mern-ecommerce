export const ROLES = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface RoleActor {
  role: Role;
}

export function hasAllowedRole(
  actor: RoleActor | null | undefined,
  allowedRoles: readonly Role[]
): boolean {
  return Boolean(actor && allowedRoles.includes(actor.role));
}
