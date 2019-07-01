import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Character,
  CharacterId,
  CharacterInsertData,
  CharacterUpdateData,
  ofCharacter,
  returnCharacter,
  returnCharacterArray,
  UserId
} from '@tabletop-companion/api-interface';
import { Observable } from 'rxjs';
import { CharacterService } from './character.service';

@Resolver(ofCharacter)
export class CharacterResolver {
  constructor(private readonly characterService: CharacterService) {}

  @Query(returnCharacter, { name: 'character' })
  getCharacter(@Args('charId') id: CharacterId): Observable<Character> {
    return this.characterService.getCharacterById(id);
  }

  @Query(returnCharacterArray, { name: 'userCharacters' })
  getUserCharacters(@Args('userId') userId: UserId): Observable<Character[]> {
    return this.characterService.getCharactersByUserId(userId);
  }

  @Mutation(returnCharacter, { name: 'newCharacter' })
  insertCharacter(
    @Args('characterData') characterInsert: CharacterInsertData
  ): Observable<Character> {
    return this.characterService.insertNewCharacter(characterInsert);
  }

  @Mutation(returnCharacter, { name: 'updateCharacter' })
  updateCharacter(
    @Args('characterData') characterUpdate: CharacterUpdateData,
    @Args('charId') charId: CharacterId
  ): Observable<Character> {
    return this.characterService.updateCharacter(characterUpdate, charId);
  }
}
