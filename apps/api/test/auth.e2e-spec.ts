import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

// Requires Postgres + Redis running (docker compose up -d) and migrations applied
// (prisma migrate dev) — this is an integration-level e2e test, not a mocked unit test.
// Cold-starting the full AppModule (Prisma connect, Redis connect) regularly exceeds
// Jest's 5s default hook timeout, hence the longer timeout below.
jest.setTimeout(30000);

describe("Auth (e2e)", () => {
  let app: INestApplication;
  const email = `e2e-${Date.now()}@career-rise.test`;
  const password = "Sup3rSecret!";

  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /auth/register creates a STUDENT and returns tokens", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);

    expect(res.body.user).toMatchObject({ email, role: "STUDENT" });
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
  });

  it("POST /auth/login returns a fresh token pair", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(200);

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    expect(accessToken).toEqual(expect.any(String));
  });

  it("GET /users/me with a valid token returns the user", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toMatchObject({ email, role: "STUDENT" });
  });

  it("GET /users/me with no token returns a uniform 401 error", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/users/me").expect(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /auth/refresh rotates the refresh token", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(res.body.refreshToken).not.toEqual(refreshToken);
    refreshToken = res.body.refreshToken;
  });

  it("POST /auth/logout revokes the refresh token", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(401);
  });
});
