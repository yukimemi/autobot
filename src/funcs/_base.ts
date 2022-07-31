export enum Result {
  SUCCESS,
  FAILURE,
}

export type Fn = (
  args: Record<string, unknown> | Record<string, unknown>[],
) => Promise<number>;
