import { FastifyRequest, FastifyReply } from 'fastify';
import { CronService } from '../services/CronService';
import { BackupService } from '../services/backupService';
import { DatabaseService } from '../services/database.service';
import { DatabaseConfig } from '../services/types';

export class CronController {
  private cronService: CronService;
  private backupService: BackupService;

  constructor(private databaseService: DatabaseService) {
    this.cronService = new CronService();
    this.backupService = new BackupService(this.databaseService);
  }

  async listCrons(_request: FastifyRequest, reply: FastifyReply) {
    const jobs = this.cronService.listCronJobs();
    reply.send({ success: true, jobs });
  }

  async startCron(request: FastifyRequest<{ Body: { jobName: string, schedule: string, dbConfig: DatabaseConfig, description?: string } }>, reply: FastifyReply) {
    const { jobName, schedule, dbConfig, description } = request.body;

    try {
      if (!jobName || !schedule || !dbConfig || !dbConfig.database) {
        throw new Error("Tous les champs 'jobName', 'schedule', et 'dbConfig.database' sont requis.");
      }

      console.log('Données reçues:', { jobName, schedule, dbConfig, description });

      this.cronService.startCronJob(jobName, schedule, dbConfig, this.backupService);

      reply.send({ success: true, message: `Tâche cron "${jobName}" ajoutée avec succès.` });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche cron :", error);
      reply.status(400).send({ success: false, message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue.' });
    }
  }

  async stopCron(request: FastifyRequest<{ Params: { jobName: string } }>, reply: FastifyReply) {
    const { jobName } = request.params;

    const result = this.cronService.stopCronJob(jobName);
    if (result) {
      reply.send({ success: true, message: `Tâche cron "${jobName}" supprimée avec succès.` });
    } else {
      reply.status(404).send({ success: false, message: `Tâche cron "${jobName}" non trouvée.` });
    }
  }
}