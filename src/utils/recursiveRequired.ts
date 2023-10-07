/** I *think* this works  */
export type RecursiveRequired<T> = {
  [P in keyof T]-?:
  T[P] extends Array<infer U> ? Array<RecursiveRequired<U>> :
    T[P] extends object | undefined ? RecursiveRequired<T[P]> :
      T[P];
}
