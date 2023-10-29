export enum MATCH_ROUND {
  QUALIFICATION = 'qual',
  ELIMINATION = 'elim'
}

export enum MATCH_ALLIANCE {
  RED = 'red',
  BLUE = 'blue'
}

export function makeTopic (matchId: number, round: MATCH_ROUND, isFinal: boolean): string {
  return `match/${round}/${matchId}/score${isFinal ? '/saved' : '/working'}`
}
