/**
 * A refresher note: the shortest write-up that gets someone who has solved a
 * problem before back to a working solution. Not a tutorial.
 *
 * `k` is the key idea. It may be left out when the problem already carries a
 * one-line `approach`, which is then used instead. `T` and `S` likewise only
 * need to be given when the problem has no complexity of its own.
 */
export interface RawNote {
  /** key idea, one sentence */
  k?: string;
  /** two to four steps, in order */
  s: string[];
  /** the mistake people make on the second attempt */
  w?: string;
  /** time complexity, when the problem has none */
  T?: string;
  /** space complexity, when the problem has none */
  S?: string;
}

export type NoteBook = Record<string, RawNote>;
