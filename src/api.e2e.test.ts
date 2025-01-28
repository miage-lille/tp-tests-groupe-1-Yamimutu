import supertest from 'supertest';
import { TestServerFixture } from './tests/fixtures';

describe('Webinar Routes E2E', () => {
  let fixture: TestServerFixture;

  beforeAll(async () => {
    fixture = new TestServerFixture();
    await fixture.init();
  });

  beforeEach(async () => {
    await fixture.reset();
  });

  afterAll(async () => {
    await fixture.stop();
  });

  describe('Scenario : Happy path', () => {
    it('should update webinar seats', async () => {
      // ARRANGE
      const prisma = fixture.getPrismaClient();
      const server = fixture.getServer();

      const webinar = await prisma.webinar.create({
        data: {
          id: 'test-webinar',
          title: 'Webinar Test',
          seats: 10,
          startDate: new Date(),
          endDate: new Date(),
          organizerId: 'test-user',
        },
      });

      // ACT
      const response = await supertest(server)
        .post(`/webinars/${webinar.id}/seats`)
        .send({ seats: '30' })
        .expect(200);

      // ASSERT
      expect(response.body).toEqual({ message: 'Seats updated' });

      const updatedWebinar = await prisma.webinar.findUnique({
        where: { id: webinar.id },
      });
      expect(updatedWebinar?.seats).toBe(30);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    it('should return 404 and error message', async () => {
      // ARRANGE
      const prisma = fixture.getPrismaClient();
      const server = fixture.getServer();

      const webinar = await prisma.webinar.create({
        data: {
          id: 'test-webinar',
          title: 'Webinar Test',
          seats: 10,
          startDate: new Date(),
          endDate: new Date(),
          organizerId: 'test-user',
        },
      });

      // ACT
      const response = await supertest(server)
        .post(`/webinars/notExistantWebinar/seats`)
        .send({ seats: '30' })
        .expect(404);

      // ASSERT
      expect(response.body).toEqual({ error: 'Webinar not found' });

      const initialWebinar = await prisma.webinar.findUnique({
        where: { id: webinar.id },
      });
      expect(initialWebinar?.seats).toBe(10);
    });
  });

  describe('Scenario: update the webinar of someone else', () => {
    it('should return 401 and error message', async () => {
      // ARRANGE
      const prisma = fixture.getPrismaClient();
      const server = fixture.getServer();

      const webinar = await prisma.webinar.create({
        data: {
          id: 'test-webinar',
          title: 'Webinar Test',
          seats: 10,
          startDate: new Date(),
          endDate: new Date(),
          organizerId: 'test-user2',
        },
      });

      // ACT
      const response = await supertest(server)
        .post(`/webinars/${webinar.id}/seats`)
        .send({ seats: '30' })
        .expect(401);

      // ASSERT
      expect(response.body).toEqual({
        error: 'User is not allowed to update this webinar',
      });

      const initialWebinar = await prisma.webinar.findUnique({
        where: { id: webinar.id },
      });
      expect(initialWebinar?.seats).toBe(10);
    });
  });

  describe('Scenario : Happy path', () => {
    it('should create webinar', async () => {
      // ARRANGE
      const prisma = fixture.getPrismaClient();
      const server = fixture.getServer();

      const webinarData = {
        userId: 'test-user',
        title: 'New Webinar',
        seats: 100,
        startDate: new Date('2025-03-03T10:00:00.000Z'),
        endDate: new Date('2025-03-03T11:00:00.000Z'),
      };

      // ACT
      const response = await supertest(server)
        .post('/webinars')
        .send(webinarData)
        .expect(201);

      // ASSERT
      const webinarId = response.body.id;
      expect(webinarId).toBe('id-1');
      expect(response.body.message).toContain('Webinar created with id-1');

      const createdWebinar = await prisma.webinar.findUnique({
        where: { id: webinarId },
      });
      expect(createdWebinar).not.toBeNull();
      expect(createdWebinar?.seats).toBe(webinarData.seats);
      expect(createdWebinar?.organizerId).toBe(webinarData.userId);
    });
  });

  describe('Scenario : Webinar is too soon', () => {
    it('should return 400 and error message', async () => {
      // ARRANGE
      const prisma = fixture.getPrismaClient();
      const server = fixture.getServer();

      const webinarData = {
        userId: 'test-user',
        title: 'New Webinar',
        seats: 100,
        startDate: new Date('2024-01-03T23:59:59.000Z'),
        endDate: new Date('2024-01-03T23:59:59.000Z'),
      };

      // ACT
      const response = await supertest(server)
        .post('/webinars')
        .send(webinarData)
        .expect(400);

      // ASSERT
      expect(response.body).toEqual({
        error: 'Webinar must be scheduled at least 3 days in advance',
      });
    });
  });

  describe('Scenario : Webinar has too many seats', () => {
    it('should return 400 and error message', async () => {
      // ARRANGE
      const prisma = fixture.getPrismaClient();
      const server = fixture.getServer();

      const webinarData = {
        userId: 'test-user',
        title: 'New Webinar',
        seats: 1500,
        startDate: new Date('2025-03-03T10:00:00.000Z'),
        endDate: new Date('2025-03-03T10:00:00.000Z'),
      };

      // ACT
      const response = await supertest(server)
        .post('/webinars')
        .send(webinarData)
        .expect(400);

      // ASSERT
      expect(response.body).toEqual({
        error: 'Webinar must have at most 1000 seats',
      });
    });
  });
});
