export enum Result {
  SUCCESS,
  FAILURE,
}

export type Fn = (
  sb: symbol,
  args: Record<string, unknown> | Record<string, unknown>[],
) => Promise<number>;
