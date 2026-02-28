import { test, expect } from "@playwright/test"

test("should navigate to the landing page and have correct title", async ({
  page,
}) => {
  // Start from the index page
  await page.goto("/")

  // The page should contain "Architect your story"
  await expect(page.locator("h1")).toContainText("Architect your story")

  // Check if "Get Started" button exists
  const getStarted = page.getByRole("link", { name: /get started/i }).first()
  await expect(getStarted).toBeVisible()
})

test("should navigate to login page", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: /login/i }).first().click()
  await expect(page).toHaveURL(/\/sign-in/)
})
