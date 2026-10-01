import { useState, useEffect, useCallback, type FormEvent, type JSX } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { getSiteSettings, type SiteSettings } from '@/services/siteSettings'
import { formatPhoneMask } from '@/lib/whatsapp'
import { StateFeedback } from '@/components/StateFeedback'
import pb from '@/lib/pocketbase/client'

interface FormErrors {
  name?: string
  phone?: string
  email?: string
  message?: string
}

export default function Contato(): JSX.Element {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true)
  const [settingsError, setSettingsError] = useState<boolean>(false)

  // Form State
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false)

  const loadSettings = useCallback(async () => {
    try {
      setLoadingSettings(true)
      setSettingsError(false)
      const data = await getSiteSettings()
      setSettings(data)
    } catch {
      setSettingsError(true)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados de contato',
        description: 'Não foi possível carregar as informações institucionais.',
      })
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useRealtime('site_settings', () => {
    loadSettings()
  })

  // Handle phone mask input
  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneMask(val)
    setPhone(formatted)
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }))
    }
  }

  // Validate form fields in Portuguese
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Nome Completo é obrigatório.'
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres.'
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone) {
      newErrors.phone = 'Telefone/WhatsApp é obrigatório.'
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Insira um telefone válido com DDD (mínimo 10 dígitos).'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório.'
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Insira um endereço de e-mail válido.'
    }

    if (!message.trim()) {
      newErrors.message = 'Mensagem é obrigatória.'
    } else if (message.trim().length < 10) {
      newErrors.message = 'Mensagem deve conter no mínimo 10 caracteres.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form to /backend/v1/contact or directly fallback to contacts collection
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast({
        variant: 'destructive',
        title: 'Verifique os campos obrigatórios',
        description: 'Por favor, preencha todos os campos destacados em vermelho.',
      })
      return
    }

    setSubmitting(true)

    try {
      // Dispatch to backend endpoint /backend/v1/contact
      const response = await fetch(`${pb.baseUrl}/backend/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      })

      if (response.ok) {
        setSuccessModalOpen(true)
        setName('')
        setPhone('')
        setEmail('')
        setMessage('')
        setErrors({})
        toast({
          title: 'Mensagem enviada',
          description: 'Recebemos seu contato com sucesso.',
        })
      } else {
        // Fallback: create in contacts collection directly via PB SDK if hook route had issue
        const errJson = await response.json().catch(() => null)
        try {
          await pb.collection('contacts').create({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            message: message.trim(),
          })
          setSuccessModalOpen(true)
          setName('')
          setPhone('')
          setEmail('')
          setMessage('')
          setErrors({})
        } catch {
          throw new Error(errJson?.error || 'Erro ao enviar mensagem')
        }
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível entregar sua mensagem. Tente novamente mais tarde.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Address fallback
  const displayAddress =
    settings?.address || 'Rua Otacílio Roxo, 150, Bairro Cerâmica, Nova Iguaçu-RJ'
  const displayPhoneFixed = settings?.phoneFixed || '21 2658-3517'
  const displayPhoneSales = settings?.phoneSales || '21 98883-1253'
  const displayPhoneFinance = settings?.phoneFinance || '21 98835-8373'
  const displayEmail = settings?.email || 'tasty@tastyplus.com.br'
  const displayHoursWeek = settings?.hoursWeek || 'Segunda a Quinta: 07:30 às 17:30'
  const displayHoursFriday = settings?.hoursFriday || 'Sexta-feira: 07:30 às 16:30'

  // Map embed URL: if valid embed URL, use as iframe src, otherwise default to search iframe
  const mapEmbedUrl = settings?.mapEmbed
    ? settings.mapEmbed.includes('output=embed') || settings.mapEmbed.includes('embed')
      ? settings.mapEmbed
      : `https://maps.google.com/maps?q=${encodeURIComponent(
          settings.mapEmbed.replace('https://maps.google.com/?q=', ''),
        )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        'Rua Otacílio Roxo, 150, Cerâmica, Nova Iguaçu - RJ',
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-fade-in">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="text-primary border-primary/30 font-semibold">
          Canais de Atendimento
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Fale com a Tasty Plus
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Tire dúvidas, solicite orçamentos para o seu volume de produção, peça amostras grátis de
          aromas ou converse com nosso suporte técnico.
        </p>
      </div>

      {settingsError && (
        <StateFeedback
          icon={<AlertTriangle className="w-12 h-12 text-destructive" />}
          title="Erro ao sincronizar informações de contato"
          description="Algumas informações da empresa podem não estar atualizadas. O formulário segue operacional."
          actionLabel="Tentar novamente"
          onAction={loadSettings}
        />
      )}

      {/* Main Grid: Form + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-3xl border border-border p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Envie uma Mensagem</h2>
            <p className="text-sm text-muted-foreground">
              Preencha os campos abaixo e nosso time comercial retornará em até 24 horas úteis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-sm font-semibold text-foreground">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact-name"
                type="text"
                disabled={submitting}
                placeholder="Ex: João Silva"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                className={`rounded-xl ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
            </div>

            {/* Grid: Telefone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Telefone/WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-sm font-semibold text-foreground">
                  Telefone / WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  disabled={submitting}
                  placeholder="(21) 98888-0000"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`rounded-xl ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-sm font-semibold text-foreground">
                  E-mail <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  disabled={submitting}
                  placeholder="seu@empresa.com.br"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  className={`rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="contact-message" className="text-sm font-semibold text-foreground">
                Mensagem <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="contact-message"
                disabled={submitting}
                rows={5}
                placeholder="Descreva seu interesse, produto desejado, volume estimado ou solicite uma amostra..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }))
                }}
                className={`rounded-xl resize-none ${errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.message && (
                <p className="text-xs text-destructive font-medium">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full font-bold text-base rounded-xl shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Enviando mensagem...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  <span>Enviar Mensagem</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Sidebar info + Google Maps (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Company Details Card */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Sede e Contatos Diretos
            </h3>

            {loadingSettings ? (
              <div className="space-y-4 animate-pulse">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-5 text-sm">
                {/* Endereço */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block text-xs uppercase tracking-wider text-muted-foreground">
                      Endereço
                    </span>
                    <p className="text-foreground leading-relaxed mt-0.5">{displayAddress}</p>
                  </div>
                </div>

                {/* Telefones */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground block text-xs uppercase tracking-wider text-muted-foreground">
                      Telefones de Atendimento
                    </span>
                    <p className="text-foreground">
                      <span className="text-muted-foreground text-xs font-medium">Fixo:</span>{' '}
                      <a
                        href={`tel:+55${displayPhoneFixed.replace(/\D/g, '')}`}
                        className="hover:text-primary transition-colors font-medium"
                      >
                        {displayPhoneFixed}
                      </a>
                    </p>
                    <p className="text-foreground">
                      <span className="text-muted-foreground text-xs font-medium">Vendas:</span>{' '}
                      <a
                        href={`tel:+55${displayPhoneSales.replace(/\D/g, '')}`}
                        className="hover:text-primary transition-colors font-medium"
                      >
                        {displayPhoneSales}
                      </a>
                    </p>
                    <p className="text-foreground">
                      <span className="text-muted-foreground text-xs font-medium">Financeiro:</span>{' '}
                      <a
                        href={`tel:+55${displayPhoneFinance.replace(/\D/g, '')}`}
                        className="hover:text-primary transition-colors font-medium"
                      >
                        {displayPhoneFinance}
                      </a>
                    </p>
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block text-xs uppercase tracking-wider text-muted-foreground">
                      E-mail Institucional
                    </span>
                    <a
                      href={`mailto:${displayEmail}`}
                      className="text-foreground hover:text-primary transition-colors font-medium break-all"
                    >
                      {displayEmail}
                    </a>
                  </div>
                </div>

                {/* Horários */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block text-xs uppercase tracking-wider text-muted-foreground">
                      Horário de Funcionamento
                    </span>
                    <p className="text-foreground">{displayHoursWeek}</p>
                    <p className="text-foreground">{displayHoursFriday}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Google Maps Responsive Embed */}
          <div className="bg-card rounded-3xl border border-border p-3 overflow-hidden shadow-sm">
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-muted/60">
              <iframe
                title="Localização Tasty Plus"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md text-center p-6 sm:p-8 rounded-2xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-extrabold text-foreground text-center">
              Mensagem enviada com sucesso!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center text-sm">
              Entraremos em contato em breve. Agradecemos pela sua mensagem e pelo interesse nas
              soluções Tasty Plus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center pt-4">
            <Button
              type="button"
              onClick={() => setSuccessModalOpen(false)}
              className="w-full sm:w-auto font-bold px-8 rounded-xl"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
