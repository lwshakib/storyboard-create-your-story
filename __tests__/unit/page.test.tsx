import { render, screen } from "@testing-library/react"
import Page from "@/app/page"

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Page />)
    // Adjust based on the actual content of your app/page.tsx
    expect(screen.getByText(/Architect your story/i)).toBeInTheDocument()
  })
})
