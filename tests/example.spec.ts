import { test, expect, _electron, ElectronApplication, Page } from '@playwright/test'

let electronApp: ElectronApplication
let page: Page

test.beforeEach(async () => {
  electronApp = await _electron.launch({
    args: ['out/main']
  })
  page = await electronApp.firstWindow()
})

test.afterEach(async () => {
  await electronApp.close()
})

test('render "Hello world!"', async () => {
  await expect(page.getByText('Hello, world!')).toBeVisible()
})
