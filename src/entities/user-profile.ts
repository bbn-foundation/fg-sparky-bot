import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  user_id = "";

  @Column()
  tokens = 0;
}
