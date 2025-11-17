# E2E Test Requirements

## Data Test IDs Required

For E2E tests to work reliably, the following `data-testid` attributes should be added to components:

### Gallery Components

1. **Gallery Container:**
   ```tsx
   <div data-testid="test-gallery" className="gallery-container">
     {/* Gallery items */}
   </div>
   ```

2. **Gallery Thumbnail Images:**
   ```tsx
   <img 
     src={card.imageUrl}
     alt={card.title}
     data-testid="gallery-thumb"
     className="gallery-thumbnail"
   />
   ```

3. **Share Button:**
   ```tsx
   <button data-testid="share-button" onClick={handleShare}>
     Share Link
   </button>
   ```

4. **Download QR Button:**
   ```tsx
   <button data-testid="download-qr" onClick={handleDownloadQR}>
     Download QR
   </button>
   ```

5. **RLS Error Display:**
   ```tsx
   <div data-testid="rls-error" className="error-message">
     RLS deny—owner only
   </div>
   ```

## Test Fixtures

Place test files in `tests/fixtures/`:

- `sample.png` - 500KB PNG file for upload tests

## Running Tests

```bash
# Install browsers
npx playwright install --with-deps chromium

# Run tests locally (headed)
npx playwright test gallery-flow.spec.ts --headed

# Run tests headless
npx playwright test gallery-flow.spec.ts

# Run specific project
npx playwright test --project=chromium
```

## Troubleshooting

### Locator Timeout Issues

- Ensure `waitForLoadState('networkidle')` is called before expects
- Add `data-testid` attributes to components
- Use specific selectors (e.g., `img[src*="optimized-thumbnail"]`)

### Mobile Emulation Issues

- macOS 12: Mobile project automatically falls back to desktop viewport
- Use `--project=chromium` to skip mobile tests

### Seed Data Issues

- Preview deployments: Database seed runs automatically in CI
- Local: Run `supabase db push` and seed manually

