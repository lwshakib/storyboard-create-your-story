import "@testing-library/jest-dom"

import * as React from "react"

// Mock framer-motion as it often has issues in jsdom environment
jest.mock("framer-motion", () => {
  const mockComponent = (tag: string) => {
    const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement(tag, props as React.Attributes, children)
    Component.displayName = `MockMotion${tag}`
    return Component
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
    AnimatePresence: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => children,
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
