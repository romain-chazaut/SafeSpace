// CronService.ts
import cron, { ScheduledTask } from 'node-cron';
import { DatabaseConfig } from '../services/types';
import { Server as SocketIOServer } from 'socket.io';
import { BackupService } from './backupService';

export class CronService {
  private cronJobs: Map<string, ScheduledTask>;

  constructor(private io: SocketIOServer) {
    this.cronJobs = new Map();
  }

  startCronJob(jobName: string, schedule: string, dbConfig: DatabaseConfig, backupService: BackupService): void {
    if (this.cronJobs.has(jobName)) {
      throw new Error(`Une tâche cron avec le nom "${jobName}" existe déjà.`);
    }

    const task = cron.schedule(schedule, async () => {
      console.log(`Exécution automatique de la sauvegarde pour ${jobName} à ${schedule}`);
      try {
        const backupPath = await backupService.createDump(dbConfig);
        await backupService.saveBackupInfo(backupPath, dbConfig);
        console.log(`Sauvegarde réussie pour la tâche "${jobName}"`);
        this.broadcastEvent('cronJobCompleted', { jobName, message: `Sauvegarde réussie pour la tâche "${jobName}"` });
      } catch (error) {
        console.error(`Erreur lors de la sauvegarde automatique pour ${jobName}:`, error);
        this.broadcastEvent('cronJobError', { jobName, message: `Erreur lors de la sauvegarde pour "${jobName}"` });
      }
    });

    this.cronJobs.set(jobName, task);
    console.log(`Tâche cron "${jobName}" ajoutée avec succès.`);
    this.broadcastEvent('cronJobAdded', { jobName, message: `Tâche cron "${jobName}" ajoutée avec succès.` });
  }

  stopCronJob(jobName: string): boolean {
    const task = this.cronJobs.get(jobName);
    if (task) {
      task.stop();
      this.cronJobs.delete(jobName);
      console.log(`Tâche cron "${jobName}" arrêtée et supprimée.`);
      this.broadcastEvent('cronJobRemoved', { jobName, message: `Tâche cron "${jobName}" arrêtée et supprimée.` });
      return true;
    }
    console.log(`Tâche cron "${jobName}" non trouvée.`);
    return false;
  }

  listCronJobs(): string[] {
    return Array.from(this.cronJobs.keys());
  }

  private broadcastEvent(event: string, data: any): void {
    this.io.emit(event, data);
  }
}