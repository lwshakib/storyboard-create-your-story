import "@testing-library/jest-dom"

import * as React from "react"

// Mock framer-motion as it often has issues in jsdom environment
jest.mock("framer-motion", () => {
  const mockComponent = (tag: string) => {
    const Component = ({
      children,
      animate,
      initial,
      exit,
      variants,
      transition,
      whileHover,
      whileTap,
      whileFocus,
      whileDrag,
      whileInView,
      layout,
      layoutId,
      layoutDependency,
      layoutScroll,
      layoutRoot,
      onAnimationStart,
      onAnimationComplete,
      onUpdate,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragTransition,
      dragSnapToOrigin,
      dragPropagation,
      transformTemplate,
      custom,
      inherit,
      viewport,
      ...domProps
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement(tag, domProps as React.Attributes, children)
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
      ul: mockComponent("ul"),
      li: mockComponent("li"),
      a: mockComponent("a"),
      img: mockComponent("img"),
    },
    AnimatePresence: ({
      children,
    }: React.PropsWithChildren<Record<string, unknown>>) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useSpring: () => 0,
    useMotionValue: () => ({ get: () => 0, set: () => {} }),
    useInView: () => false,
    m: {
      div: mockComponent("div"),
      section: mockComponent("section"),
      span: mockComponent("span"),
    },
  }
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
