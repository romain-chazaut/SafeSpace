import { FastifyRequest, FastifyReply } from 'fastify';
import { CronService } from '../services/CronService';
import { BackupService } from '../services/backupService'; // Assurez-vous que BackupService est correctement importé

export class CronController {
  private cronService: CronService;
  private backupService: BackupService;

  constructor() {
    this.cronService = new CronService();
    this.backupService = new BackupService();
  }

  // Lister toutes les tâches cron
  async listCrons(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const jobs = this.cronService.listCronJobs();
      reply.send({ success: true, jobs });
    } catch (error) {
      reply.status(500).send({ success: false, message: 'Erreur lors de la récupération des tâches cron.' });
    }
  }

  async startCron(request: FastifyRequest<{ Body: { jobName: string, schedule: string, database: string } }>, reply: FastifyReply) {
    const { jobName, schedule, database } = request.body;
    
    try {
      if (!jobName || !schedule || !database) {
        return reply.status(400).send({ success: false, message: "Tous les champs 'jobName', 'schedule', et 'database' sont requis." });
      }
  
      this.cronService.startCronJob(jobName, schedule, { database }, this.backupService);
      reply.send({ success: true, message: `Tâche cron "${jobName}" ajoutée avec succès.` });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erreur lors de l'ajout de la tâche cron :", error);
        reply.status(400).send({ success: false, message: error.message });
      } else {
        reply.status(500).send({ success: false, message: 'Une erreur inconnue est survenue.' });
      }
    }
  }

  // Arrêter une tâche cron
  async stopCron(request: FastifyRequest<{ Params: { jobName: string } }>, reply: FastifyReply) {
    const { jobName } = request.params;
  
    // Vérification si le nom de la tâche cron est vide ou invalide
    if (!jobName || jobName.trim() === '') {
      reply.status(400).send({ success: false, message: 'Nom de la tâche cron invalide.' });
      return;
    }
  
    const result = this.cronService.stopCronJob(jobName);
    if (result) {
      reply.send({ success: true, message: `Tâche cron "${jobName}" supprimée avec succès.` });
    } else {
      reply.status(404).send({ success: false, message: `Tâche cron "${jobName}" non trouvée.` });
    }
  }
}
