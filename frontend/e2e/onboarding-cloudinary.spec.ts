import { expect, test } from '@playwright/test'

const TEST_SESSION = {
  accessToken: 'playwright-test-access-token',
  user: {
    id: 'playwright-user-1',
    email: 'playwright.user@flately.demo',
    name: 'Playwright User',
    picture: '',
  },
}

const CLOUDINARY_IMAGE_URL =
  'https://res.cloudinary.com/test-cloud/image/upload/v1/flately/profiles/signed-upload.png'
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8yq+0AAAAASUVORK5CYII='

test.describe('Onboarding Cloudinary Signed Upload', () => {
  test('uses signed backend flow and renders uploaded image', async ({ page }) => {
    const requestChain: string[] = []
    let signatureCalls = 0
    let cloudinaryUploadCalls = 0

    await page.addInitScript((session) => {
      window.localStorage.setItem('flately.auth.session.v1', JSON.stringify(session))
    }, TEST_SESSION)

    await page.route('**/profiles/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null',
      })
    })

    await page.route('**/preferences/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null',
      })
    })

    await page.route('**/uploads/signature', async (route) => {
      signatureCalls += 1
      requestChain.push('signature')

      expect(route.request().method()).toBe('POST')
      expect(route.request().headers().authorization).toBe(
        `Bearer ${TEST_SESSION.accessToken}`,
      )

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cloudName: 'test-cloud',
          apiKey: 'test-api-key',
          folder: 'flately/profiles',
          timestamp: 1743900000,
          signature: 'test-signature',
        }),
      })
    })

    await page.route('https://api.cloudinary.com/**/image/upload', async (route) => {
      cloudinaryUploadCalls += 1
      requestChain.push('cloudinary-upload')

      const postData = route.request().postData() || ''
      expect(postData).toContain('name="signature"')
      expect(postData).toContain('name="api_key"')
      expect(postData).toContain('name="timestamp"')
      expect(postData).toContain('name="folder"')
      expect(postData).not.toContain('name="upload_preset"')

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          secure_url: CLOUDINARY_IMAGE_URL,
        }),
      })
    })

    await page.route('https://res.cloudinary.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(TINY_PNG_BASE64, 'base64'),
      })
    })

    await page.goto('/app/onboarding')

    await expect(page.getByTestId('cloudinary-status-badge')).toContainText(
      'signed backend available',
    )

    const chooserPromise = page.waitForEvent('filechooser')
    await page.getByLabel('Upload profile photo').click()
    const chooser = await chooserPromise

    await chooser.setFiles({
      name: 'upload-proof.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })

    const uploadedImage = page.getByAltText('Uploaded profile')

    await expect(uploadedImage).toBeVisible()
    await expect(uploadedImage).toHaveAttribute('src', CLOUDINARY_IMAGE_URL)

    const imageState = await uploadedImage.evaluate((node) => {
      const image = node as HTMLImageElement
      return {
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      }
    })

    expect(imageState.complete).toBe(true)
    expect(imageState.naturalWidth).toBeGreaterThan(0)
    expect(imageState.naturalHeight).toBeGreaterThan(0)

    expect(signatureCalls).toBeGreaterThanOrEqual(2)
    expect(cloudinaryUploadCalls).toBe(1)

    const signatureIndex = requestChain.indexOf('signature')
    const cloudinaryUploadIndex = requestChain.indexOf('cloudinary-upload')

    expect(signatureIndex).toBeGreaterThanOrEqual(0)
    expect(cloudinaryUploadIndex).toBeGreaterThanOrEqual(0)
    expect(signatureIndex).toBeLessThan(cloudinaryUploadIndex)
  })
})
