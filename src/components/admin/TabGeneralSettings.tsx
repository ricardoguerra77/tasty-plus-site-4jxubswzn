import { useState, useEffect, type JSX, type FormEvent } from 'react'
import {
  getSiteSettings,
  saveSiteSettings,
  getFileUrl,
  type SiteSettings,
} from '@/services/siteSettings'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'

export function TabGeneralSettings(): JSX.Element {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  // Form states
  const [tagline, setTagline] = useState<string>('')
  const [heroSlide1Title, setHeroSlide1Title] = useState<string>('')
  const [heroSlide1Subtitle, setHeroSlide1Subtitle] = useState<string>('')
  const [heroSlide2Title, setHeroSlide2Title] = useState<string>('')
  const [heroSlide2Subtitle, setHeroSlide2Subtitle] = useState<string>('')
  const [heroSlide3Title, setHeroSlide3Title] = useState<string>('')
  const [heroSlide3Subtitle, setHeroSlide3Subtitle] = useState<string>('')

  // Files
  const [logoFile, setLogoFile] = useState<File | null | undefined>(undefined)
  const [logoDarkFile, setLogoDarkFile] = useState<File | null | undefined>(undefined)
  const [heroImage1File, setHeroImage1File] = useState<File | null | undefined>(undefined)
  const [heroImage2File, setHeroImage2File] = useState<File | null | undefined>(undefined)
  const [heroImage3File, setHeroImage3File] = useState<File | null | undefined>(undefined)

  // Rich texts
  const [companyIntro, setCompanyIntro] = useState<string>('')
  const [mission, setMission] = useState<string>('')
  const [vision, setVision] = useState<string>('')
  const [values, setValues] = useState<string>('')
  const [history, setHistory] = useState<string>('')

  // ISO & Contact
  const [isoBadge, setIsoBadge] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [phoneFixed, setPhoneFixed] = useState<string>('')
  const [phoneSales, setPhoneSales] = useState<string>('')
  const [phoneFinance, setPhoneFinance] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [hoursWeek, setHoursWeek] = useState<string>('')
  const [hoursFriday, setHoursFriday] = useState<string>('')
  const [mapEmbed, setMapEmbed] = useState<string>('')
  const [facebook, setFacebook] = useState<string>('')
  const [instagram, setInstagram] = useState<string>('')
  const [whatsapp, setWhatsapp] = useState<string>('')

  useEffect(() => {
    let mounted = true
    async function load(): Promise<void> {
      try {
        setLoading(true)
        const data = await getSiteSettings()
        if (!mounted) return
        if (data) {
          setSettings(data)
          setTagline(data.tagline || '')
          setHeroSlide1Title(data.heroSlide1Title || '')
          setHeroSlide1Subtitle(data.heroSlide1Subtitle || '')
          setHeroSlide2Title(data.heroSlide2Title || '')
          setHeroSlide2Subtitle(data.heroSlide2Subtitle || '')
          setHeroSlide3Title(data.heroSlide3Title || '')
          setHeroSlide3Subtitle(data.heroSlide3Subtitle || '')

          setCompanyIntro(data.companyIntro || '')
          setMission(data.mission || '')
          setVision(data.vision || '')
          setValues(data.values || '')
          setHistory(data.history || '')

          setIsoBadge(Boolean(data.isoBadge))
          setAddress(data.address || '')
          setPhoneFixed(data.phoneFixed || '')
          setPhoneSales(data.phoneSales || '')
          setPhoneFinance(data.phoneFinance || '')
          setEmail(data.email || '')
          setHoursWeek(data.hoursWeek || '')
          setHoursFriday(data.hoursFriday || '')
          setMapEmbed(data.mapEmbed || '')
          setFacebook(data.facebook || '')
          setInstagram(data.instagram || '')
          setWhatsapp(data.whatsapp || '')
        }
      } catch (err) {
        toast({
          title: 'Erro ao carregar configurações',
          description: getErrorMessage(err),
          variant: 'destructive',
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [toast])

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: Parameters<typeof saveSiteSettings>[0] = {
        tagline,
        heroSlide1Title,
        heroSlide1Subtitle,
        heroSlide2Title,
        heroSlide2Subtitle,
        heroSlide3Title,
        heroSlide3Subtitle,
        companyIntro,
        mission,
        vision,
        values,
        history,
        isoBadge,
        address,
        phoneFixed,
        phoneSales,
        phoneFinance,
        email,
        hoursWeek,
        hoursFriday,
        mapEmbed,
        facebook,
        instagram,
        whatsapp,
      }

      if (logoFile !== undefined) payload.logo = logoFile
      if (logoDarkFile !== undefined) payload.logoDark = logoDarkFile
      if (heroImage1File !== undefined) payload.heroImage1 = heroImage1File
      if (heroImage2File !== undefined) payload.heroImage2 = heroImage2File
      if (heroImage3File !== undefined) payload.heroImage3 = heroImage3File

      const updated = await saveSiteSettings(payload)
      setSettings(updated)
      setLogoFile(undefined)
      setLogoDarkFile(undefined)
      setHeroImage1File(undefined)
      setHeroImage2File(undefined)
      setHeroImage3File(undefined)

      toast({
        title: 'Sucesso',
        description: 'Alterações salvas com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar configurações',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando configurações...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-8 pb-20">
      {/* Sticky Save Bar */}
      <div className="sticky top-16 z-20 -mx-4 flex items-center justify-between border-b bg-background/95 px-6 py-3 shadow-sm backdrop-blur md:-mx-8">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground md:text-base">
            Configurações Gerais do Site
          </h2>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Personalize textos institucionais, imagens dos banners e dados de contato.
          </p>
        </div>
        <Button
          type="submit"
          disabled={saving}
          id="btn-save-general-settings"
          className="flex items-center gap-2 shadow-sm"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </>
          )}
        </Button>
      </div>

      {/* 1. Logotipo e Identidade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identidade Visual</CardTitle>
          <CardDescription>
            Logotipo principal e slogan da marca exibidos no cabeçalho e rodapé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ImageUploader
              label="Logotipo da Empresa (Fundo Claro)"
              helperText="Usada no modo claro. Recomendado: SVG ou PNG transparente (máx. 5MB)"
              currentImageUrl={
                settings?.id && settings.logo
                  ? getFileUrl('site_settings', settings.id, settings.logo)
                  : undefined
              }
              onFileSelect={(file) => setLogoFile(file)}
              disabled={saving}
            />

            <ImageUploader
              label="Logotipo para Fundo Escuro"
              helperText="Usada no modo escuro e rodapé escuro. Recomendado: SVG ou PNG transparente (máx. 5MB)"
              currentImageUrl={
                settings?.id && settings.logoDark
                  ? getFileUrl('site_settings', settings.id, settings.logoDark)
                  : undefined
              }
              onFileSelect={(file) => setLogoDarkFile(file)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-sm font-semibold">
              Slogan / Tagline Institucional
            </Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ex: Soluções em Aromas e Ingredientes para a Indústria Alimentícia"
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Hero Slides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Banners Principais (Hero Slider)</CardTitle>
          <CardDescription>
            Configure os 3 slides com título, subtítulo e imagem de fundo da página inicial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Slide 1 */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-sm font-bold text-foreground">Slide 1 (Principal)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heroSlide1Title" className="text-sm">
                  Título do Slide 1
                </Label>
                <Input
                  id="heroSlide1Title"
                  value={heroSlide1Title}
                  onChange={(e) => setHeroSlide1Title(e.target.value)}
                  placeholder="Título impactante para o primeiro slide"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSlide1Subtitle" className="text-sm">
                  Subtítulo do Slide 1
                </Label>
                <Input
                  id="heroSlide1Subtitle"
                  value={heroSlide1Subtitle}
                  onChange={(e) => setHeroSlide1Subtitle(e.target.value)}
                  placeholder="Subtítulo descritivo"
                  disabled={saving}
                />
              </div>
            </div>
            <ImageUploader
              label="Imagem de Fundo - Slide 1"
              helperText="Recomendado: 1920x800px em formato JPG ou WebP"
              previewAspect="banner"
              currentImageUrl={
                settings?.id && settings.heroImage1
                  ? getFileUrl('site_settings', settings.id, settings.heroImage1)
                  : undefined
              }
              onFileSelect={(file) => setHeroImage1File(file)}
              disabled={saving}
            />
          </div>

          {/* Slide 2 */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-sm font-bold text-foreground">Slide 2</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heroSlide2Title" className="text-sm">
                  Título do Slide 2
                </Label>
                <Input
                  id="heroSlide2Title"
                  value={heroSlide2Title}
                  onChange={(e) => setHeroSlide2Title(e.target.value)}
                  placeholder="Título para o segundo slide"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSlide2Subtitle" className="text-sm">
                  Subtítulo do Slide 2
                </Label>
                <Input
                  id="heroSlide2Subtitle"
                  value={heroSlide2Subtitle}
                  onChange={(e) => setHeroSlide2Subtitle(e.target.value)}
                  placeholder="Subtítulo descritivo"
                  disabled={saving}
                />
              </div>
            </div>
            <ImageUploader
              label="Imagem de Fundo - Slide 2"
              helperText="Recomendado: 1920x800px em formato JPG ou WebP"
              previewAspect="banner"
              currentImageUrl={
                settings?.id && settings.heroImage2
                  ? getFileUrl('site_settings', settings.id, settings.heroImage2)
                  : undefined
              }
              onFileSelect={(file) => setHeroImage2File(file)}
              disabled={saving}
            />
          </div>

          {/* Slide 3 */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-sm font-bold text-foreground">Slide 3</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heroSlide3Title" className="text-sm">
                  Título do Slide 3
                </Label>
                <Input
                  id="heroSlide3Title"
                  value={heroSlide3Title}
                  onChange={(e) => setHeroSlide3Title(e.target.value)}
                  placeholder="Título para o terceiro slide"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSlide3Subtitle" className="text-sm">
                  Subtítulo do Slide 3
                </Label>
                <Input
                  id="heroSlide3Subtitle"
                  value={heroSlide3Subtitle}
                  onChange={(e) => setHeroSlide3Subtitle(e.target.value)}
                  placeholder="Subtítulo descritivo"
                  disabled={saving}
                />
              </div>
            </div>
            <ImageUploader
              label="Imagem de Fundo - Slide 3"
              helperText="Recomendado: 1920x800px em formato JPG ou WebP"
              previewAspect="banner"
              currentImageUrl={
                settings?.id && settings.heroImage3
                  ? getFileUrl('site_settings', settings.id, settings.heroImage3)
                  : undefined
              }
              onFileSelect={(file) => setHeroImage3File(file)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Textos Institucionais (Rich Text / Editor) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Textos Institucionais</CardTitle>
          <CardDescription>
            Apresentação, missão, visão, valores e trajetória histórica da Tasty Aromas e Sabores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RichTextEditor
            id="companyIntro"
            label="Apresentação da Empresa (Quem Somos)"
            value={companyIntro}
            onChange={setCompanyIntro}
            disabled={saving}
            rows={4}
          />

          <div className="grid gap-6 md:grid-cols-3">
            <RichTextEditor
              id="mission"
              label="Missão"
              value={mission}
              onChange={setMission}
              disabled={saving}
              rows={3}
            />
            <RichTextEditor
              id="vision"
              label="Visão"
              value={vision}
              onChange={setVision}
              disabled={saving}
              rows={3}
            />
            <RichTextEditor
              id="values"
              label="Valores"
              value={values}
              onChange={setValues}
              disabled={saving}
              rows={3}
            />
          </div>

          <RichTextEditor
            id="history"
            label="Nossa História"
            value={history}
            onChange={setHistory}
            disabled={saving}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* 4. Certificação ISO & Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Certificação e Contatos</CardTitle>
          <CardDescription>
            Selo de conformidade ISO 9001 e dados para contato e localização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <Label htmlFor="isoBadge" className="text-base font-semibold">
                  Exibir Selo ISO 9001
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Ativa o selo visual de conformidade com a norma ISO 9001 no rodapé e páginas de
                produtos.
              </p>
            </div>
            <Switch
              id="isoBadge"
              checked={isoBadge}
              onCheckedChange={setIsoBadge}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold">
              Endereço Completo
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. das Indústrias, 1500 - Distrito Industrial, São Paulo - SP"
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="phoneFixed" className="text-sm">
                Telefone Fixo
              </Label>
              <Input
                id="phoneFixed"
                value={phoneFixed}
                onChange={(e) => setPhoneFixed(e.target.value)}
                placeholder="(11) 3456-7890"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneSales" className="text-sm">
                Telefone Vendas / Comercial
              </Label>
              <Input
                id="phoneSales"
                value={phoneSales}
                onChange={(e) => setPhoneSales(e.target.value)}
                placeholder="(11) 98765-4321"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneFinance" className="text-sm">
                Telefone Financeiro
              </Label>
              <Input
                id="phoneFinance"
                value={phoneFinance}
                onChange={(e) => setPhoneFinance(e.target.value)}
                placeholder="(11) 3456-7899"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                E-mail Institucional
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@tastyplus.com.br"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursWeek" className="text-sm">
                Horário (Segunda a Quinta)
              </Label>
              <Input
                id="hoursWeek"
                value={hoursWeek}
                onChange={(e) => setHoursWeek(e.target.value)}
                placeholder="08:00 às 18:00"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursFriday" className="text-sm">
                Horário (Sexta-feira)
              </Label>
              <Input
                id="hoursFriday"
                value={hoursFriday}
                onChange={(e) => setHoursFriday(e.target.value)}
                placeholder="08:00 às 17:00"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mapEmbed" className="text-sm font-semibold">
              URL do Mapa (Google Maps Embed)
            </Label>
            <Input
              id="mapEmbed"
              value={mapEmbed}
              onChange={(e) => setMapEmbed(e.target.value)}
              placeholder="https://maps.google.com/..."
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-sm">
                Facebook (URL)
              </Label>
              <Input
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm">
                Instagram (URL)
              </Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm">
                WhatsApp Link Direto (URL)
              </Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="https://wa.me/5511..."
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
