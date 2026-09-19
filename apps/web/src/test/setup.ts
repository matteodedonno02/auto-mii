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

// jsdom has no object URL support: the labeler store creates one per photo.
if (typeof URL.createObjectURL !== 'function') {
  Object.defineProperty(URL, 'createObjectURL', {
    value: (blob: Blob) => `blob:test/${blob instanceof File ? blob.name : 'blob'}`,
    writable: true,
    configurable: true,
  })
}

if (typeof URL.revokeObjectURL !== 'function') {
  Object.defineProperty(URL, 'revokeObjectURL', { value: () => undefined, writable: true, configurable: true })
}
