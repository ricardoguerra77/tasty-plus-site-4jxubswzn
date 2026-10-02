import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import Contato from '@/pages/Contato'
import * as siteSettingsService from '@/services/siteSettings'
import type { SiteSettings } from '@/services/siteSettings'

describe('Footer and Public Contacts Dynamic site_settings Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Footer renders full configured address including CEP from site_settings', async () => {
    const mockSettings: Partial<SiteSettings> = {
      id: 'mock_settings_id',
      address: 'Rua Otacílio Roxo, 150 Bairro: Cerâmica CEP: 26.030-800 - Nova Iguaçu - RJ',
      phoneFixed: '(21) 2658-3517',
      phoneSales: '(21) 98883-1253',
      phoneFinance: '(21) 98835-8373',
      email: 'tasty@tastyplus.com.br',
      hoursWeek: 'Segunda a Quinta: 07:30 às 17:30',
      hoursFriday: 'Sexta-feira: 07:30 às 16:30',
      facebook: 'https://facebook.com/tastyplus',
      instagram: 'https://instagram.com/tastyplus',
      whatsapp: 'https://wa.me/5521988831253',
    }

    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(mockSettings as SiteSettings)

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    )

    // Wait for settings to load
    await waitFor(() => {
      expect(
        screen.getByText(
          'Rua Otacílio Roxo, 150 Bairro: Cerâmica CEP: 26.030-800 - Nova Iguaçu - RJ',
        ),
      ).toBeDefined()
    })

    // Verify CEP is explicitly present in footer
    const addressElement = screen.getByText(/26\.030-800/)
    expect(addressElement).toBeDefined()
    expect(addressElement.textContent).toContain('26.030-800')

    // Verify configured phone numbers
    expect(screen.getByText('(21) 2658-3517')).toBeDefined()
    expect(screen.getAllByText('(21) 98883-1253').length).toBeGreaterThan(0)
    expect(screen.getByText('(21) 98835-8373')).toBeDefined()

    // Verify email & hours
    expect(screen.getByText('tasty@tastyplus.com.br')).toBeDefined()
    expect(screen.getByText('Segunda a Quinta: 07:30 às 17:30')).toBeDefined()
    expect(screen.getByText('Sexta-feira: 07:30 às 16:30')).toBeDefined()
  })

  it('Footer hides address, phones, email/hours if they are empty in site_settings (no fallback invented)', async () => {
    const emptySettings: Partial<SiteSettings> = {
      id: 'mock_empty_settings',
      address: '',
      phoneFixed: '',
      phoneSales: '',
      phoneFinance: '',
      email: '',
      hoursWeek: '',
      hoursFriday: '',
      facebook: '',
      instagram: '',
      whatsapp: '',
    }

    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(
      emptySettings as SiteSettings,
    )

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    )

    await waitFor(() => {
      // Ensure no skeleton remains
      expect(document.querySelector('[data-testid="footer-col-address-loading"]')).toBeNull()
    })

    // Address column should be hidden entirely
    expect(screen.queryByTestId('footer-col-address')).toBeNull()
    expect(screen.queryByText(/Otacílio Roxo/i)).toBeNull()
    expect(screen.queryByText(/26\.030-800/)).toBeNull()

    // Phones column should be hidden entirely
    expect(screen.queryByTestId('footer-col-phones')).toBeNull()
    expect(screen.queryByText(/2658-3517/)).toBeNull()

    // Email & hours column should be hidden entirely
    expect(screen.queryByTestId('footer-col-hours')).toBeNull()
  })

  it('Contato page reads address with CEP and Google Maps embed from site_settings', async () => {
    const mockSettings: Partial<SiteSettings> = {
      id: 'mock_settings_id',
      address: 'Rua Otacílio Roxo, 150 Bairro: Cerâmica CEP: 26.030-800 - Nova Iguaçu - RJ',
      phoneFixed: '(21) 2658-3517',
      phoneSales: '(21) 98883-1253',
      phoneFinance: '(21) 98835-8373',
      email: 'tasty@tastyplus.com.br',
      hoursWeek: 'Segunda a Quinta: 07:30 às 17:30',
      hoursFriday: 'Sexta-feira: 07:30 às 16:30',
      mapEmbed: 'https://www.google.com/maps?q=-22.7366964,-43.4751478&z=17&output=embed',
    }

    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(mockSettings as SiteSettings)

    render(
      <BrowserRouter>
        <Contato />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Rua Otacílio Roxo, 150 Bairro: Cerâmica CEP: 26.030-800 - Nova Iguaçu - RJ',
        ),
      ).toBeDefined()
    })

    // Check Google Maps iframe src
    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.getAttribute('src')).toBe(
      'https://www.google.com/maps?q=-22.7366964,-43.4751478&z=17&output=embed',
    )
  })

  it('Contato page hides items if fields are empty and does not invent fallbacks', async () => {
    const emptySettings: Partial<SiteSettings> = {
      id: 'mock_settings_empty',
      address: '',
      phoneFixed: '',
      phoneSales: '',
      phoneFinance: '',
      email: '',
      hoursWeek: '',
      hoursFriday: '',
      mapEmbed: '',
    }

    vi.spyOn(siteSettingsService, 'getSiteSettings').mockResolvedValue(
      emptySettings as SiteSettings,
    )

    render(
      <BrowserRouter>
        <Contato />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(document.querySelector('[data-testid="sidebar-contacts-loading"]')).toBeNull()
    })

    expect(screen.queryByTestId('sidebar-address')).toBeNull()
    expect(screen.queryByTestId('sidebar-phones')).toBeNull()
    expect(screen.queryByTestId('sidebar-email')).toBeNull()
    expect(screen.queryByTestId('sidebar-hours')).toBeNull()
    expect(screen.queryByTestId('map-container')).toBeNull()
  })
})
