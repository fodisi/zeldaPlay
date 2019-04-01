import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { compareSync, hashSync } from 'bcryptjs';
import { Observable, of } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';

import { NewUserDTO, UserDTO } from '@Body/index';
import { DbService } from '@Db/db.service';
import { DbPlayer } from '@DbModel/index';

const noUser = 'No user found for email ';

const registerFirst = '. Please register first.';

@Injectable()
export class UserService {
  constructor(private readonly dbService: DbService) {}

  login(user: UserDTO): Observable<DbPlayer> {
    return this.dbService
      .query<DbPlayer>(
        `SELECT
        id as "pId"
        ,email as "pEmail"
        ,password as "pPassword"
      FROM zeldaplay.players
      WHERE email = $1`,
        [user.email]
      )
      .pipe(
        map((dbUsers) => {
          const dbUser = dbUsers[0];
          if (!dbUser) {
            throw new UnauthorizedException(
              noUser + user.email + registerFirst
            );
          } else if (compareSync(user.password, dbUser.pPassword)) {
            return dbUser;
          } else {
            throw new UnauthorizedException('Invalid email or password.');
          }
        })
      );
  }

  signup(user: NewUserDTO): Observable<DbPlayer> {
    return this.dbService
      .query<DbPlayer>(
        `SELECT id as "pId" FROM zeldaplay.players WHERE email = $1`,
        [user.email]
      )
      .pipe(
        tap((existingUser) => {
          if (existingUser.length > 0) {
            throw new ConflictException(
              'That email already exists. Please log in or choose another email.'
            );
          }
        }),
        flatMap(() =>
          this.dbService.query<DbPlayer>(
            `INSERT INTO zeldaplay.players
          (email, password) VALUES
          ($1, $2) RETURNING id as "pId"`,
            [user.email, hashSync(user.password, 12)]
          )
        ),
        map((players) => {
          const player = players[0];
          let insertString = '';
          const insertValues = [];
          let count = 0;
          for (const recovery of user.recovery) {
            insertString += `($${1 + count * 3}, $${2 + count * 3}, $${3 +
              count * 3}),`;
            insertValues.push(
              recovery.question,
              hashSync(recovery.answer, 12),
              player.pId
            );
            count++;
          }
          insertString = insertString.substring(0, insertString.length - 1);
          this.dbService
            .query(
              `INSERT INTO zeldaplay.recoveries
          (question, answer, player_id) VALUES ${insertString}`,
              insertValues
            )
            .subscribe();
          return player;
        })
      );
  }

  findUserByEmail(email: string): Observable<DbPlayer[]> {
    return this.dbService
      .query<DbPlayer>(
        `SELECT id as "pId" FROM zeldaplay.players WHERE email = $1`,
        [email]
      )
      .pipe(
        tap((users) => {
          if (!users.length) {
            throw new UnauthorizedException(noUser + email + registerFirst);
          } else {
            return users;
          }
        })
      );
  }

  getPlayerInfo(id: string): Observable<any> {
    return of([]);
  }
}
