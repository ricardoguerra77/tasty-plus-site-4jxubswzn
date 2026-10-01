import { useState, useEffect, useMemo, useCallback, type JSX } from 'react'
import {
  Users,
  MapPin,
  Phone,
  MessageCircle,
  Briefcase,
  AlertTriangle,
  Building2,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  listRepresentatives,
  type Representative,
  type RepresentativeRole,
} from '@/services/representatives'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { StateFeedback } from '@/components/StateFeedback'

const DEFAULT_SALES_PHONE = '21 98883-1253'

export default function Representantes(): JSX.Element {
  const [reps, setReps] = useState<Representative[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  const fetchRepresentatives = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const data = await listRepresentatives({ sort: 'order,name' })
      setReps(data)
    } catch {
      setError(true)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar representantes',
        description: 'Não foi possível carregar a lista de atendimento regional.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepresentatives()
  }, [fetchRepresentatives])

  // Realtime subscription on representatives collection
  useRealtime('representatives', () => {
    fetchRepresentatives()
  })

  // Group representatives by region
  const groupedByRegion = useMemo(() => {
    const map = new Map<string, Representative[]>()
    reps.forEach((rep) => {
      const region = rep.region?.trim() || 'Outras Regiões'
      if (!map.has(region)) {
        map.set(region, [])
      }
      map.get(region)!.push(rep)
    })
    return Array.from(map.entries())
  }, [reps])

  const getRoleBadgeVariant = (role: RepresentativeRole) => {
    if (role === 'Representante Distribuidor') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    }
    return 'bg-primary/10 text-primary border-primary/30'
  }

  // Format tel: link
  const buildTelLink = (phone?: string) => {
    if (!phone) return '#'
    const digits = phone.replace(/\D/g, '')
    return `tel:+55${digits}`
  }

  // Invitation whatsapp link
  const repApplicationWhatsApp = buildWhatsAppLink(
    DEFAULT_SALES_PHONE,
    'Olá! Tenho interesse em ser um Representante Comercial / Distribuidor da Tasty Plus na minha região.',
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="text-primary border-primary/30 font-semibold">
          Atendimento Nacional
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Nossos Representantes
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Encontre o representante ou distribuidor Tasty Plus mais próximo da sua indústria.
          Atendimento técnico, envio de catálogos e amostras para a sua empresa.
        </p>
      </div>

      {/* CONTENT: 4 STATES (LOADING / ERROR / EMPTY / SUCCESS) */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
        </div>
      ) : error ? (
        <StateFeedback
          icon={<AlertTriangle className="w-12 h-12 text-destructive" />}
          title="Erro ao carregar representantes"
          description="Ocorreu uma instabilidade na conexão. Por favor, tente recarregar."
          actionLabel="Tentar novamente"
          onAction={fetchRepresentatives}
        />
      ) : reps.length === 0 ? (
        <StateFeedback
          icon={<Users className="w-12 h-12 text-muted-foreground/60" />}
          title="Nenhum representante cadastrado no momento"
          description="Nossa equipe central está disponível para atender a sua região diretamente pelo canal de vendas."
          actionLabel="Falar com a Central"
          onAction={() => window.open(repApplicationWhatsApp, '_blank')}
        />
      ) : (
        /* SUCCESS: GROUPED BY REGION */
        <div className="space-y-12">
          {groupedByRegion.map(([region, regionalReps]) => (
            <div key={region} className="space-y-6">
              {/* Region Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">{region}</h2>
                  <p className="text-xs text-muted-foreground">
                    {regionalReps.length}{' '}
                    {regionalReps.length === 1
                      ? 'profissional credenciado'
                      : 'profissionais credenciados'}
                  </p>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regionalReps.map((rep) => {
                  const repWhatsAppUrl = rep.whatsapp
                    ? buildWhatsAppLink(
                        rep.whatsapp,
                        `Olá ${rep.name}, gostaria de atendimento comercial da Tasty Plus para minha empresa.`,
                      )
                    : null

                  return (
                    <div
                      key={rep.id}
                      className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {rep.name}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={`font-semibold text-xs ${getRoleBadgeVariant(rep.role)}`}
                          >
                            <Briefcase className="w-3 h-3 mr-1" />
                            {rep.role}
                          </Badge>
                          <Badge variant="secondary" className="text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {rep.region}
                          </Badge>
                        </div>
                      </div>

                      {/* Contact Actions: One-click dial & WhatsApp */}
                      <div className="pt-2 border-t border-border/60 space-y-2.5">
                        {rep.phone && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              Telefone:
                            </span>
                            <a
                              href={buildTelLink(rep.phone)}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                              title="Ligue com um clique"
                            >
                              {rep.phone}
                            </a>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {rep.phone ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="font-semibold text-xs"
                            >
                              <a href={buildTelLink(rep.phone)}>
                                <Phone className="w-3.5 h-3.5 mr-1 text-primary" />
                                Ligar
                              </a>
                            </Button>
                          ) : (
                            <div />
                          )}

                          {repWhatsAppUrl ? (
                            <Button
                              asChild
                              size="sm"
                              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs shadow-sm"
                            >
                              <a href={repWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                                WhatsApp
                              </a>
                            </Button>
                          ) : (
                            <div />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CALLOUT: INVITATION TO NEW REPRESENTATIVES */}
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-card p-8 md:p-12 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3">
            <Badge variant="outline" className="text-primary border-primary/30 font-semibold">
              Expansão Comercial
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Seja um Representante Tasty Plus na sua região
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Você já atua no fornecimento para indústrias de bebidas, laticínios, panificação ou
              confeitaria? Junte-se a uma marca sólida com mais de 30 anos de mercado, portfólio
              completo e suporte técnico especializado.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="font-bold whitespace-nowrap shadow-md text-sm md:text-base flex-shrink-0"
          >
            <a href={repApplicationWhatsApp} target="_blank" rel="noopener noreferrer">
              Cadastre-se como Representante
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
