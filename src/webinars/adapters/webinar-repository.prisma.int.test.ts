// Test d'intégration
import { TestServerFixture } from 'src/tests/fixtures';
import { PrismaWebinarRepository } from 'src/webinars/adapters/webinar-repository.prisma';
import { Webinar } from 'src/webinars/entities/webinar.entity';

describe('PrismaWebinarRepository', () => {
  let fixture: TestServerFixture;
  let repository: PrismaWebinarRepository;

  beforeAll(async () => {
    fixture = new TestServerFixture();
    await fixture.init();
  });

  beforeEach(async () => {
    await fixture.reset();
    const prismaClient = fixture.getPrismaClient();
    repository = new PrismaWebinarRepository(prismaClient);
  });

  afterAll(async () => {
    await fixture.stop();
  });

  describe('Scenario : repository.create', () => {
    it('should create a webinar', async () => {
      // ARRANGE
      const webinar = new Webinar({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });

      // ACT
      await repository.create(webinar);

      // ASSERT
      const maybeWebinar = await fixture.getPrismaClient().webinar.findUnique({
        where: { id: 'webinar-id' },
      });
      expect(maybeWebinar).toEqual({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });
    });
  });

  describe('Scenario : repository.findById', () => {
    it('should find a webinar', async () => {
      // ARRANGE
      const webinar = new Webinar({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });

      await fixture.getPrismaClient().webinar.create({
        data: {
          id: webinar.props.id,
          organizerId: webinar.props.organizerId,
          title: webinar.props.title,
          startDate: webinar.props.startDate,
          endDate: webinar.props.endDate,
          seats: webinar.props.seats,
        },
      });

      // ACT
      const maybeWebinar = await repository.findById('webinar-id');

      // ASSERT
      expect(maybeWebinar?.props).toEqual({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });
    });
  });

  describe('Scenario : repository.update', () => {
    it('should update a webinar', async () => {
      // ARRANGE
      const webinar = new Webinar({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });

      await fixture.getPrismaClient().webinar.create({
        data: {
          id: webinar.props.id,
          organizerId: webinar.props.organizerId,
          title: webinar.props.title,
          startDate: webinar.props.startDate,
          endDate: webinar.props.endDate,
          seats: webinar.props.seats,
        },
      });

      // ACT
      webinar.props.title = 'Updated webinar title';
      webinar.props.seats = 200;
      await repository.update(webinar);

      // ASSERT
      const maybeUpdatedWebinar = await fixture
        .getPrismaClient()
        .webinar.findUnique({
          where: { id: 'webinar-id' },
        });
      expect(maybeUpdatedWebinar).toEqual({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Updated webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 200,
      });
    });
  });

  describe('Scenario : repository.delete', () => {
    it('should delete a webinar', async () => {
      // ARRANGE
      const webinar = new Webinar({
        id: 'webinar-id',
        organizerId: 'organizer-id',
        title: 'Webinar title',
        startDate: new Date('2022-01-01T00:00:00Z'),
        endDate: new Date('2022-01-01T01:00:00Z'),
        seats: 100,
      });

      await fixture.getPrismaClient().webinar.create({
        data: {
          id: webinar.props.id,
          organizerId: webinar.props.organizerId,
          title: webinar.props.title,
          startDate: webinar.props.startDate,
          endDate: webinar.props.endDate,
          seats: webinar.props.seats,
        },
      });

      // ACT
      await repository.delete(webinar.props.id);

      // ASSERT
      const noWebinair = await fixture.getPrismaClient().webinar.findUnique({
        where: { id: 'webinar-id' },
      });
      expect(noWebinair).toEqual(null);
    });
  });
});
