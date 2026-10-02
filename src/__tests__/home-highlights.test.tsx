import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home'
import * as siteSettingsService from '@/services/siteSettings'
import type { SiteSettings } from '@/services/siteSettings'

vi.mock('@/hooks/use-realtime', () => ({
  useRealtime: vi.fn(),
}))

const mockSettingsWithHighlights: SiteSettings = {
  id: 'test-settings',
  tagline: 'Soluções em Aromas, Extratos e Ingredientes para a Indústria Alimentícia',
  heroOverlayOpacity: 45,
  highlight1: `<h3>Adoçante Dietético</h3><p>DESPACHO PARA TODO O BRASIL</p><p>R$ 600,00</p>`,
  highlight2: `<h3>Café-Cola Gelado Tasty</h3><p>Inovação refrescante unindo o melhor do café premium com a vibração da cola</p>`,
  highlight3: `<h3>NATU-COLA</h3><p>100% Natural</p><p>Sabor cola 100% autêntico e natural</p>`,
  phoneSales: '21 98883-1253',
  companyIntro: '<p>A Tasty Aromas e Sabores é referência nacional.</p>',
}

describe('Home Dynamic Commercial Highlights', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all 3 highlight cards when all highlight fields are populated', async () => {
    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(mockSettingsWithHighlights)

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('section-highlights')).toBeDefined()
    })

    expect(screen.getByTestId('highlight-card-1')).toBeDefined()
    expect(screen.getByTestId('highlight-card-2')).toBeDefined()
    expect(screen.getByTestId('highlight-card-3')).toBeDefined()
    expect(screen.getByText('Adoçante Dietético')).toBeDefined()
    expect(screen.getByText('Café-Cola Gelado Tasty')).toBeDefined()
    expect(screen.getByText('NATU-COLA')).toBeDefined()
  })

  it('hides individual card when its highlight field is empty', async () => {
    const settingsWithMissingH2: SiteSettings = {
      ...mockSettingsWithHighlights,
      highlight2: '', // Card 2 empty
    }
    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(settingsWithMissingH2)

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('section-highlights')).toBeDefined()
    })

    expect(screen.getByTestId('highlight-card-1')).toBeDefined()
    expect(screen.queryByTestId('highlight-card-2')).toBeNull()
    expect(screen.getByTestId('highlight-card-3')).toBeDefined()
  })

  it('hides entire highlights section when all 3 fields are empty', async () => {
    const settingsEmpty: SiteSettings = {
      ...mockSettingsWithHighlights,
      highlight1: '',
      highlight2: '<p></p>',
      highlight3: '',
    }
    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(settingsEmpty)

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByTestId('section-highlights')).toBeNull()
    })
  })

  it('sanitizes unsafe scripts in highlight rich-text fields', async () => {
    const settingsWithXss: SiteSettings = {
      ...mockSettingsWithHighlights,
      highlight1: `<h3>Adoçante</h3><script>alert("hack")</script><img src="x" onerror="alert(1)">`,
    }
    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(settingsWithXss)

    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('highlight-card-1')).toBeDefined()
    })

    expect(container.querySelector('script')).toBeNull()
  })

  it('ensures no visible "Tasty Plus" is rendered in highlights or intro', async () => {
    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(mockSettingsWithHighlights)

    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('section-highlights')).toBeDefined()
    })

    const textContent = container.textContent || ''
    expect(textContent).not.toContain('Tasty Plus')
    expect(textContent).toContain('Tasty Aromas e Sabores')
  })
})
