import "@testing-library/jest-dom"

// Mock framer-motion as it often has issues in jsdom environment
jest.mock("framer-motion", () => {
  const React = require("react")
  const mockComponent = (tag: string) => {
    return ({ children, ...props }: any) =>
      React.createElement(tag, props, children)
  }
  return {
    motion: {
      div: mockComponent("div"),
      h1: mockComponent("h1"),
      p: mockComponent("p"),
      span: mockComponent("span"),
      nav: mockComponent("nav"),
      section: mockComponent("section"),
      header: mockComponent("header"),
      footer: mockComponent("footer"),
      main: mockComponent("main"),
      button: mockComponent("button"),
    },
    AnimatePresence: ({ children }: any) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useSpring: () => 0,
  }
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
