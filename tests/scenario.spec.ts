import { test, _electron, expect } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import * as eph from 'electron-playwright-helpers'
import { existsSync, readdirSync, rmSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let electronApp: ElectronApplication
let page: Page

test.beforeEach(async () => {
  const testUserDataPath = join(__dirname, 'test-user-data')
  const testNotesPath = join(__dirname, 'notes')

  if (existsSync(testUserDataPath)) {
    rmSync(testUserDataPath, { recursive: true })
  }
  if (existsSync(testNotesPath)) {
    const entries = readdirSync(testNotesPath)
    for (const entry of entries) {
      if (entry !== 'example.md') {
        rmSync(join(testNotesPath, entry), { recursive: true })
      }
    }
  }
  const mainPath = join(__dirname, '..', 'out', 'main')
  electronApp = await _electron.launch({
    args: [mainPath, `--user-data-dir=${testUserDataPath}`]
  })
  page = await electronApp.firstWindow()
  await eph.stubDialog(electronApp, 'showOpenDialog', { filePaths: [testNotesPath] })
})

test.afterEach(async () => {
  await electronApp.close()
})

test('Scenario', async () => {
  await page.getByText('Open').click()
  await page.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByRole('heading', { name: 'Untitled', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Untitled', exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Title' }).focus()
  await page.keyboard.insertText('Test')
  await expect(page.getByRole('heading', { name: 'UntitledTest', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'UntitledTest', exact: true })).toBeVisible()
  await page.waitForTimeout(1000)
  await page.getByText('example').click()
  await page.getByText('This is a test.').click()
  await expect(page.locator('a.cm-hyper-link-icon').first()).toBeVisible()
  await expect(page.getByRole('img')).toBeVisible()

  // TODO: Context menu
})
