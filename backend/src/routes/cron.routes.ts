import { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, FastifyTypeProviderDefault, RawServerDefault, RouteGenericInterface } from 'fastify';
import { ResolveFastifyRequestType } from 'fastify/types/type-provider';
import { IncomingMessage, ServerResponse } from 'http';
import { CronController } from '../controllers/CronController';

export default async function cronRoutes(fastify: FastifyInstance) {
  const cronController = new CronController();

  // Route pour lister les crons
  fastify.get('/crons', async (request: FastifyRequest<RouteGenericInterface, RawServerDefault, IncomingMessage, FastifySchema, FastifyTypeProviderDefault, unknown, FastifyBaseLogger, ResolveFastifyRequestType<FastifyTypeProviderDefault, FastifySchema, RouteGenericInterface>>, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
    await cronController.listCrons(request, reply);
  });

  // Route pour démarrer une nouvelle tâche cron
  fastify.post('/crons', async (request: FastifyRequest<{ Body: { jobName: string; schedule: string; database: string; }; }, RawServerDefault, IncomingMessage, FastifySchema, FastifyTypeProviderDefault, unknown, FastifyBaseLogger, ResolveFastifyRequestType<FastifyTypeProviderDefault, FastifySchema, { Body: { jobName: string; schedule: string; database: string; }; }>>, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
    await cronController.startCron(request, reply);
  });

  // Route pour arrêter une tâche cron
  fastify.delete('/crons/:jobName', async (request: FastifyRequest<{ Params: { jobName: string; }; }, RawServerDefault, IncomingMessage, FastifySchema, FastifyTypeProviderDefault, unknown, FastifyBaseLogger, ResolveFastifyRequestType<FastifyTypeProviderDefault, FastifySchema, { Params: { jobName: string; }; }>>, reply: FastifyReply<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, FastifyTypeProviderDefault, unknown>) => {
    await cronController.stopCron(request, reply);
  });
}
