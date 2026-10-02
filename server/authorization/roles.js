const ROLES = Object.freeze({
  CUSTOMER: "customer",
  VENDOR: "vendor",
  ADMIN: "admin",
});

function hasAllowedRole(actor, allowedRoles) {
  return Boolean(actor && allowedRoles.includes(actor.role));
}

module.exports = { ROLES, hasAllowedRole };
