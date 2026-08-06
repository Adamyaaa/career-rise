import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { RolesGuard } from "./roles.guard";
import { AuthenticatedUser } from "../../auth/strategies/jwt.strategy";

function buildContext(user: AuthenticatedUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  const student: AuthenticatedUser = { id: "u1", email: "s@test.dev", role: Role.STUDENT };
  const mentor: AuthenticatedUser = { id: "u2", email: "m@test.dev", role: Role.MENTOR };

  function guardWithRequiredRoles(roles: Role[] | undefined): RolesGuard {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(roles),
    } as unknown as Reflector;
    return new RolesGuard(reflector);
  }

  it("allows any authenticated user when no roles are required", () => {
    const guard = guardWithRequiredRoles(undefined);
    expect(guard.canActivate(buildContext(student))).toBe(true);
  });

  it("allows a user whose role is in the required list", () => {
    const guard = guardWithRequiredRoles([Role.MENTOR, Role.SUPER_ADMIN]);
    expect(guard.canActivate(buildContext(mentor))).toBe(true);
  });

  it("denies a user whose role is not in the required list", () => {
    const guard = guardWithRequiredRoles([Role.MENTOR, Role.SUPER_ADMIN]);
    expect(guard.canActivate(buildContext(student))).toBe(false);
  });

  it("denies when there is no authenticated user", () => {
    const guard = guardWithRequiredRoles([Role.MENTOR]);
    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });
});
