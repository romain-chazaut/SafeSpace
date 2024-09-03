// backend/src/database/entities/DatabaseConnection.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DatabaseConnection {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    name!: string;

  @Column()
    type!: string;

  @Column()
    host!: string;

  @Column()
    port!: number;

  @Column()
    username!: string;

  @Column()
    password!: string;

  @Column()
    database!: string;
}
