const test = require("node:test");
const assert = require("node:assert/strict");
const { ROLES, hasAllowedRole } = require("../authorization/roles");

test("customer is not authorized for vendor operations", () => {
  assert.equal(hasAllowedRole({ role: ROLES.CUSTOMER }, [ROLES.VENDOR]), false);
});

test("vendor is authorized for vendor role checks", () => {
  assert.equal(hasAllowedRole({ role: ROLES.VENDOR }, [ROLES.VENDOR]), true);
});

test("admin is authorized only when admin is explicitly allowed", () => {
  assert.equal(hasAllowedRole({ role: ROLES.ADMIN }, [ROLES.VENDOR]), false);
  assert.equal(hasAllowedRole({ role: ROLES.ADMIN }, [ROLES.ADMIN]), true);
});
