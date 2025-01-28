import { FastifyInstance } from 'fastify';
import { AppContainer } from 'src/container';
import { User } from 'src/users/entities/user.entity';
import { WebinarNotFoundException } from 'src/webinars/exceptions/webinar-not-found';
import { WebinarNotOrganizerException } from 'src/webinars/exceptions/webinar-not-organizer';
import { WebinarDatesTooSoonException } from './exceptions/webinar-dates-too-soon';
import { WebinarTooManySeatsException } from './exceptions/webinar-too-many-seats';

export async function webinarRoutes(
  fastify: FastifyInstance,
  container: AppContainer,
) {
  const changeSeatsUseCase = container.getChangeSeatsUseCase();
  const organizeWebinarsUseCase = container.getOrganizeWebinarsUseCase();

  fastify.post<{
    Body: { seats: string };
    Params: { id: string };
  }>('/webinars/:id/seats', {}, async (request, reply) => {
    const changeSeatsCommand = {
      seats: parseInt(request.body.seats, 10),
      webinarId: request.params.id,
      user: new User({
        id: 'test-user',
        email: 'test@test.com',
        password: 'fake',
      }),
    };

    try {
      await changeSeatsUseCase.execute(changeSeatsCommand);
      reply.status(200).send({ message: 'Seats updated' });
    } catch (err) {
      if (err instanceof WebinarNotFoundException) {
        return reply.status(404).send({ error: err.message });
      }
      if (err instanceof WebinarNotOrganizerException) {
        return reply.status(401).send({ error: err.message });
      }
      reply.status(500).send({ error: 'An error occurred' });
    }
  });

  fastify.post<{
    Body: {
      userId: string;
      title: string;
      seats: number;
      startDate: Date;
      endDate: Date;
    };
  }>('/webinars', {}, async (request, reply) => {
    const organizeWebinarCommand = {
      userId: request.body.userId,
      title: request.body.title,
      seats: request.body.seats,
      startDate: request.body.startDate,
      endDate: request.body.endDate,
    };

    try {
      const response = await organizeWebinarsUseCase.execute(
        organizeWebinarCommand,
      );
      const id = response.id;
      reply.status(201).send({ id, message: `Webinar created with ${id}` });
    } catch (err) {
      if (err instanceof WebinarDatesTooSoonException) {
        return reply.status(400).send({ error: err.message });
      }
      if (err instanceof WebinarTooManySeatsException) {
        return reply.status(400).send({ error: err.message });
      }
      reply.status(500).send({ error: 'An error occurred' });
    }
  });
}
