// Tests unitaires

import { testUser } from "src/users/tests/user-seeds";
import { ChangeSeats } from "./change-seats";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { Webinar } from "../entities/webinar.entity";
import { User } from "src/users/entities/user.entity";


describe('Feature : Change seats', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  function expectWebinarToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('webinar-id');
    expect(webinar?.props.seats).toEqual(100);
  }

  async function whenUserChangeSeatsWith(payload: { user: User; webinarId: string; seats: number; }){
    await useCase.execute(payload);
  }

  async function thenUpdatedWebinarSeatsShouldBe(nbSeats: number){
    const updatedWebinar = await webinarRepository.findById('webinar-id');
    expect(updatedWebinar?.props.seats).toEqual(nbSeats);
  }

  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  // Initialisation de nos tests, boilerplates...
  describe('Scenario: Happy path', () => {
    // Code commun à notre scénario : payload...
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 200,
    };
    
    it('should change the number of seats for a webinar', async () => {
      // Vérification de la règle métier, condition testée...
      // ACT
      await whenUserChangeSeatsWith(payload);
      // ASSERT
      await thenUpdatedWebinarSeatsShouldBe(200);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'non-existing-webinar-id',
      seats: 200,
    };
    it('should fail', async () => {
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrow('Webinar not found');    
      expectWebinarToRemainUnchanged();
    });
  });

  describe('update the webinar of someone else', () => {
    const payload = {
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 200,
    };
    it('should fail', async () => {
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrow('User is not allowed to update this webinar');
      expectWebinarToRemainUnchanged();
    });
  });

  describe('change seat to an inferior number', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 50,
    };
    it('should fail', async () => {
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrow('You cannot reduce the number of seats');
      expectWebinarToRemainUnchanged();
    });
  });

  describe('change seat to a number > 1000', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 1100,
    };
    it('should fail', async () => {
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrow('Webinar must have at most 1000 seats');
      expectWebinarToRemainUnchanged();
    });
  });

});