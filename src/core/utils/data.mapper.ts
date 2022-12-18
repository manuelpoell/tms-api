export interface DataMapper<T, U> {
  (from: T): U;
}
