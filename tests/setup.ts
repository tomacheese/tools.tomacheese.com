import { vi, beforeEach } from 'vitest'

// Mock navigator.clipboard for clipboard functionality tests
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
  writable: true,
})

// Mock console methods to reduce noise in tests but keep them available for debugging
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
}

// Mock window methods that might be used
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
  },
  writable: true,
})

// Mock localStorage with error handling capabilities
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  }),
  // Helper to simulate localStorage errors
  simulateError: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock crypto for security functions
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    }),
    randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  },
  writable: true,
})

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => ({
    tagName: tagName.toUpperCase(),
    textContent: '',
    innerHTML: '',
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  writable: true,
})

// Global error handler for uncaught errors in tests
const originalAddEventListener = window.addEventListener
window.addEventListener = vi.fn((event, handler, options) => {
  if (event === 'error' || event === 'unhandledrejection') {
    // Track error events for testing
    return
  }
  return originalAddEventListener.call(window, event, handler, options)
})

// Reset all mocks after each test
beforeEach(() => {
  vi.clearAllMocks()
  mockLocalStorage.store = {}
})
