// Small artificial latency so mock-backed pages still show real loading/skeleton states
// instead of resolving instantly — kept short so the prototype still feels responsive.
export function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
