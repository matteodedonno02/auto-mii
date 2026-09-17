import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver and no canvas 2D context: components treat both
// as optional, so behavior tests focus on roles, labels and state.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverStub })
}
