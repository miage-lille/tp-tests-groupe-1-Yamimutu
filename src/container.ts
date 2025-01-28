import { PrismaClient } from '@prisma/client';
import { PrismaWebinarRepository } from 'src/webinars/adapters/webinar-repository.prisma';
import { ChangeSeats } from 'src/webinars/use-cases/change-seats';
import { OrganizeWebinars } from 'src/webinars/use-cases/organize-webinar';
import { FixedDateGenerator } from './core/adapters/fixed-date-generator';
import { FixedIdGenerator } from './core/adapters/fixed-id-generator';

export class AppContainer {
  private prismaClient!: PrismaClient;
  private webinarRepository!: PrismaWebinarRepository;
  private changeSeatsUseCase!: ChangeSeats;
  private organizeWebinarsUseCase!: OrganizeWebinars;
  private dateGenerator!: FixedDateGenerator;
  private idGenerator!: FixedIdGenerator;

  init(prismaClient: PrismaClient) {
    this.idGenerator = new FixedIdGenerator();
    this.dateGenerator = new FixedDateGenerator();
    this.prismaClient = prismaClient;
    this.webinarRepository = new PrismaWebinarRepository(this.prismaClient);
    this.changeSeatsUseCase = new ChangeSeats(this.webinarRepository);
    this.organizeWebinarsUseCase = new OrganizeWebinars(
      this.webinarRepository,
      this.idGenerator,
      this.dateGenerator,
    );
  }

  getPrismaClient() {
    return this.prismaClient;
  }

  getChangeSeatsUseCase() {
    return this.changeSeatsUseCase;
  }

  getOrganizeWebinarsUseCase() {
    return this.organizeWebinarsUseCase;
  }
}

export const container = new AppContainer();
