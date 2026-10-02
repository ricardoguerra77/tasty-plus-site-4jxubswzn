import { useState, useEffect, type JSX } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShieldCheck, Target, ArrowRight, Award } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import {
  getSiteSettings,
  getFileUrl,
  resolveSiteLogoUrl,
  type SiteSettings,
} from '@/services/siteSettings'
import { useRealtime } from '@/hooks/use-realtime'

export default function Qualidade(): JSX.Element {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    getSiteSettings().then((res) => {
      if (res) setSettings(res)
    })
  }, [])

  useRealtime('site_settings', () => {
    getSiteSettings().then((res) => {
      if (res) setSettings(res)
    })
  })

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()

    const observer = new MutationObserver(() => {
      checkDark()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const logoUrl = resolveSiteLogoUrl(settings, isDark)
  const orgChartImageUrl =
    settings && settings.orgChartImage
      ? getFileUrl('site_settings', settings.id, settings.orgChartImage)
      : null
  const flowChartImageUrl =
    settings && settings.flowChartImage
      ? getFileUrl('site_settings', settings.id, settings.flowChartImage)
      : null

  const whatsAppUrl = buildWhatsAppLink(
    '5521988831253',
    'Olá! Gostaria de saber mais sobre a Gestão de Qualidade e certificações da Tasty Aromas e Sabores.',
  )

  const diretrizes = [
    'Satisfação dos clientes;',
    'Desenvolvimento profissional dos colaboradores;',
    'Parceria com nossos fornecedores;',
    'Eficiência e eficácia dos processos.',
  ]

  const objetivos = [
    'Garantir a execução dos serviços, de acordo com a solicitação dos clientes;',
    'Garantir a satisfação de clientes;',
    'Manter programas de treinamento e educação;',
    'Garantir a eficiência dos processos;',
    'Monitorar o desempenho de provedores externos.',
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in">
      {/* Hero / Header Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Tasty Aromas e Sabores"
              className="h-16 md:h-20 w-auto max-w-[260px] object-contain drop-shadow-sm"
            />
          ) : (
            <BrandLogo
              className="h-16 md:h-20 w-auto object-contain drop-shadow-sm"
              alt="Tasty Aromas e Sabores"
            />
          )}
        </div>
        <Badge className="bg-accent/15 text-accent dark:bg-accent/25 border-accent/30 font-display font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
          Sistema de Gestão da Qualidade (SGQ)
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-primary dark:text-foreground tracking-tight">
          Política e Gestão da Qualidade
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Garantia rigorosa de excelência, controle de processos e padronização contínua na produção
          de aromas e aditivos para alimentos e bebidas.
        </p>
      </section>

      {/* CONTEÚDO 1 — Documento Oficial da Qualidade (Card Oficial) */}
      <section className="relative">
        <div className="max-w-4xl mx-auto bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
          {/* Top Document Header Bar */}
          <div className="bg-primary/5 dark:bg-muted/40 border-b border-border px-6 py-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Tasty Aromas e Sabores"
                  className="h-12 w-auto max-w-[180px] object-contain drop-shadow-sm"
                />
              ) : (
                <BrandLogo className="h-12 w-auto object-contain" alt="Tasty Aromas e Sabores" />
              )}
              <div>
                <span className="font-display font-bold text-lg text-primary dark:text-foreground block">
                  Tasty Aromas e Sabores
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Documento Oficial • Sistema de Gestão da Qualidade
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Diretrizes e Requisitos Vigentes</span>
            </div>
          </div>

          <div className="p-6 sm:p-10 md:p-12 space-y-10">
            {/* Bloco 1: Política de Qualidade */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary dark:text-foreground tracking-tight">
                  Política de Qualidade
                </h2>
              </div>

              <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-normal">
                A Tasty Aromas e Sabores está comprometida com o atendimento aos requisitos e com a
                melhoria contínua de seu Sistema de Gestão da Qualidade, tendo como base as
                seguintes diretrizes:
              </p>

              {/* Lista com ícones de check */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {diretrizes.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/60 dark:bg-muted/40 border border-border/70 hover:border-accent/40 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5 font-bold">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-foreground leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divisor elegante */}
            <div className="border-t border-border/80 my-8" />

            {/* Bloco 2: OBJETIVOS DA QUALIDADE */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-accent tracking-widest uppercase">
                    Metas Operacionais
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-primary dark:text-foreground uppercase tracking-tight">
                    OBJETIVOS DA QUALIDADE
                  </h3>
                </div>
              </div>

              <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-normal">
                Para consolidar a Política da Qualidade da Tasty Aromas e Sabores foram definidos os
                seguintes Objetivos da Qualidade:
              </p>

              {/* Lista com ícones de check */}
              <ul className="space-y-3 pt-1">
                {objetivos.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/60 dark:bg-muted/40 border border-border/70 hover:border-accent/40 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5 font-bold">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </span>
                    <span className="text-sm sm:text-base font-medium text-foreground leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO 2 — ORGANOGRAMA */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-primary/10 text-primary dark:bg-primary/25 border-primary/20 font-display font-semibold px-3 py-1 rounded-full text-xs">
            Estrutura Organizacional
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-primary dark:text-foreground uppercase tracking-tight">
            ORGANOGRAMA
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Representação formal da hierarquia corporativa da Tasty Aromas e Sabores, destacando a
            Diretoria, o Representanteda Direção (RD) e as áreas técnicas, de produção,
            administrativa e comercial.
          </p>
        </div>

        {/* Quadro do Organograma */}
        <div className="bg-card rounded-3xl border border-border p-4 sm:p-8 md:p-10 shadow-lg overflow-x-auto">
          {orgChartImageUrl ? (
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <img
                src={orgChartImageUrl}
                alt="Organograma da empresa"
                className="w-full h-auto max-h-[900px] object-contain rounded-xl shadow-sm"
              />
            </div>
          ) : (
            /* Visualizador do Organograma: Desktop SVG Conectores + HTML Caixas */
            <div className="min-w-[860px] lg:min-w-0 max-w-5xl mx-auto py-6 px-4">
              {/* Layout em Grid / Flex com conexões claras */}
              <div className="grid grid-cols-12 gap-4 items-start relative">
                {/* Coluna 1 (Cols 1-3): Diretoria + RD */}
                <div className="col-span-3 flex flex-col items-center pt-24 space-y-6">
                  {/* Diretoria Box */}
                  <div className="w-full max-w-[210px] rounded-xl bg-blue-100 dark:bg-blue-950/70 border-2 border-blue-400 dark:border-blue-600 p-4 text-center shadow-md">
                    <span className="font-display font-bold text-sm sm:text-base text-blue-900 dark:text-blue-200 block">
                      Diretoria
                    </span>
                  </div>

                  {/* Linha vertical conectora */}
                  <div className="w-0.5 h-6 bg-blue-400 dark:bg-blue-600" />

                  {/* RD Box (Representanteda Direção) */}
                  <div className="w-full max-w-[210px] rounded-xl bg-blue-100/90 dark:bg-blue-950/60 border border-blue-400 dark:border-blue-600 p-3 text-center shadow-sm">
                    <span className="font-display font-medium text-xs sm:text-sm text-blue-950 dark:text-blue-200 block leading-tight">
                      Representanteda Direção (RD)
                    </span>
                  </div>
                </div>

                {/* Coluna Central de Conexão SVG (Cols 4) */}
                <div className="col-span-1 h-full min-h-[460px] relative flex items-center justify-center">
                  <svg
                    className="w-full h-full absolute inset-0 text-blue-400 dark:text-blue-500 overflow-visible"
                    viewBox="0 0 60 480"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    preserveAspectRatio="none"
                  >
                    {/* Linha saindo de Diretoria (y ~= 118) até a espinha vertical (x=30) */}
                    <line x1="0" y1="120" x2="30" y2="120" />
                    {/* Espinha vertical conectando as 5 linhas intermediárias */}
                    <line x1="30" y1="36" x2="30" y2="436" />
                    {/* Linha para Técnica em Química */}
                    <line x1="30" y1="36" x2="60" y2="36" />
                    {/* Linha para Auxiliar de PCP */}
                    <line x1="30" y1="102" x2="60" y2="102" />
                    {/* Linha para Supervisor de Produção */}
                    <line x1="30" y1="168" x2="60" y2="168" />
                    {/* Linha para Gerente Administrativa */}
                    <line x1="30" y1="288" x2="60" y2="288" />
                    {/* Linha para Gerente Comercial */}
                    <line x1="30" y1="436" x2="60" y2="436" />
                  </svg>
                </div>

                {/* Coluna 2 (Cols 5-7): As 5 caixas intermediárias */}
                <div className="col-span-4 flex flex-col space-y-4">
                  {/* 1. Técnica em Química */}
                  <div className="h-14 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-400 dark:border-blue-600 px-3 flex items-center justify-center text-center shadow-sm">
                    <span className="font-display font-semibold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                      Técnica em Química
                    </span>
                  </div>

                  {/* 2. Auxiliar de PCP */}
                  <div className="h-14 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-400 dark:border-blue-600 px-3 flex items-center justify-center text-center shadow-sm">
                    <span className="font-display font-semibold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                      Auxiliar de PCP
                    </span>
                  </div>

                  {/* 3. Supervisor de Produção */}
                  <div className="h-14 rounded-xl bg-blue-100 dark:bg-blue-950/70 border-2 border-blue-400 dark:border-blue-500 px-3 flex items-center justify-center text-center shadow-md">
                    <span className="font-display font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                      Supervisor de Produção
                    </span>
                  </div>

                  {/* Espaço antes de Gerente Administrativa para alinhar visualmente com sub-ramos */}
                  <div className="h-8" />

                  {/* 4. Gerente Administrativa */}
                  <div className="h-16 rounded-xl bg-blue-100 dark:bg-blue-950/70 border-2 border-blue-400 dark:border-blue-500 px-3 flex items-center justify-center text-center shadow-md">
                    <span className="font-display font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                      Gerente Administrativa
                    </span>
                  </div>

                  <div className="h-12" />

                  {/* 5. Gerente Comercial */}
                  <div className="h-16 rounded-xl bg-blue-100 dark:bg-blue-950/70 border-2 border-blue-400 dark:border-blue-500 px-3 flex items-center justify-center text-center shadow-md">
                    <span className="font-display font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                      Gerente Comercial
                    </span>
                  </div>
                </div>

                {/* Coluna 3 Conector SVG Sub-ramos (Col 8) */}
                <div className="col-span-1 h-full min-h-[520px] relative flex items-center justify-center">
                  <svg
                    className="w-full h-full absolute inset-0 text-blue-400 dark:text-blue-500 overflow-visible"
                    viewBox="0 0 50 560"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    preserveAspectRatio="none"
                  >
                    {/* Supervisor de Produção (y ~= 158) -> 2 saídas (Aux Produção y=140, Aux Expedição y=182) */}
                    <line x1="0" y1="156" x2="25" y2="156" />
                    <line x1="25" y1="138" x2="25" y2="182" />
                    <line x1="25" y1="138" x2="50" y2="138" />
                    <line x1="25" y1="182" x2="50" y2="182" />

                    {/* Gerente Administrativa (y ~= 280) -> 4 saídas */}
                    <line x1="0" y1="284" x2="25" y2="284" />
                    <line x1="25" y1="230" x2="25" y2="380" />
                    <line x1="25" y1="230" x2="50" y2="230" />
                    <line x1="25" y1="280" x2="50" y2="280" />
                    <line x1="25" y1="330" x2="50" y2="330" />
                    <line x1="25" y1="380" x2="50" y2="380" />

                    {/* Gerente Comercial (y ~= 486) -> 2 saídas */}
                    <line x1="0" y1="486" x2="25" y2="486" />
                    <line x1="25" y1="460" x2="25" y2="512" />
                    <line x1="25" y1="460" x2="50" y2="460" />
                    <line x1="25" y1="512" x2="50" y2="512" />
                  </svg>
                </div>

                {/* Coluna 4 (Cols 9-10): Subordinados */}
                <div className="col-span-3 flex flex-col space-y-2">
                  {/* Espaçador até o nível de Supervisor de Produção */}
                  <div className="h-[118px]" />

                  {/* Subordinados Supervisor Produção */}
                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar de Produção
                    </span>
                  </div>
                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar de Expedição
                    </span>
                  </div>

                  {/* Espaçador até nível Administrativo */}
                  <div className="h-[16px]" />

                  {/* Subordinados Gerente Administrativa */}
                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar Administrativo
                    </span>
                  </div>

                  {/* Auxiliar de Suprimentos (conecta com Almoxarifado à direita) */}
                  <div className="relative">
                    <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                      <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                        Auxiliar de Suprimentos
                      </span>
                    </div>
                  </div>

                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar de Gestão de Pessoas
                    </span>
                  </div>
                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar de Serviços Gerais
                    </span>
                  </div>

                  {/* Espaçador até Comercial */}
                  <div className="h-[18px]" />

                  {/* Subordinados Gerente Comercial */}
                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar de Faturamento
                    </span>
                  </div>
                  <div className="h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 flex items-center justify-center text-center shadow-xs">
                    <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                      Auxiliar Comercial
                    </span>
                  </div>
                </div>

                {/* Coluna 5 (Cols 11-12): Auxiliar de Almoxarifado conectado ao Auxiliar de Suprimentos */}
                <div className="col-span-1 h-full min-h-[520px] relative flex flex-col justify-start">
                  <div className="h-[268px]" />
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-blue-400 dark:bg-blue-600 flex-shrink-0" />
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-400 dark:border-blue-700 px-2.5 py-2 text-center shadow-xs min-w-[120px]">
                      <span className="text-xs font-medium text-blue-950 dark:text-blue-200 block leading-tight">
                        Auxiliar de Almoxarifado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            * Conforme organograma oficial da Tasty Aromas e Sabores Ltda.
          </p>
        </div>
      </section>

      {/* CONTEÚDO 3 — FLUXOGRAMA */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-display font-semibold px-3 py-1 rounded-full text-xs">
            Mapeamento de Processos
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-primary dark:text-foreground uppercase tracking-tight">
            FLUXOGRAMA
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fluxo integrado dos processos chave: da entrada de requisitos do cliente à expedição,
            suprimentos, gestão de apoio e garantia de satisfação.
          </p>
        </div>

        {/* Quadro Geral do Fluxograma com as bordas e barras originais */}
        <div className="bg-card rounded-3xl border-2 border-border/90 p-4 sm:p-6 md:p-8 shadow-xl overflow-x-auto">
          {flowChartImageUrl ? (
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <img
                src={flowChartImageUrl}
                alt="Fluxograma do sistema de gestão da qualidade"
                className="w-full h-auto max-h-[900px] object-contain rounded-xl shadow-sm"
              />
            </div>
          ) : (
            <div className="min-w-[880px] max-w-5xl mx-auto border-2 border-dashed border-border/80 rounded-2xl p-4 sm:p-6 bg-background/50 relative">
              {/* Barra Superior: GESTÃO DA QUALIDADE (verde-clara como no original) */}
              <div className="w-full bg-[#86efac] dark:bg-emerald-900/60 border border-[#4ade80] dark:border-emerald-600 rounded-lg py-2.5 px-4 text-center shadow-sm">
                <span className="font-display font-extrabold text-xs sm:text-sm tracking-widest uppercase text-emerald-950 dark:text-emerald-100">
                  GESTÃO DA QUALIDADE
                </span>
              </div>

              {/* Corpo Central: Coluna Esquerda + Área de Fluxo Central + Coluna Direita */}
              <div className="grid grid-cols-12 gap-3 sm:gap-4 my-5 items-stretch min-h-[380px]">
                {/* Coluna Esquerda: REQUISITOS DO CLIENTE (barra vertical amarelada/verde-oliva) */}
                <div className="col-span-1 bg-[#fef08a] dark:bg-amber-950/50 border border-[#facc15] dark:border-amber-700 rounded-lg flex items-center justify-center py-6 shadow-sm">
                  <span
                    className="font-display font-extrabold text-[11px] sm:text-xs text-amber-950 dark:text-amber-200 tracking-wider uppercase select-none"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    REQUISITOS DO CLIENTE
                  </span>
                </div>

                {/* Área Central: Fluxo de Caixas Laranja/Salmão com Setas Bidirecionais e Apoio (10 cols) */}
                <div className="col-span-10 flex flex-col justify-between py-2 px-2 sm:px-4 space-y-6">
                  {/* Topo do fluxo: DESENVOLV. DE PRODUTOS */}
                  <div className="grid grid-cols-5 gap-3 items-center">
                    <div className="col-span-1">
                      <div className="rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 p-2 text-center shadow-sm">
                        <span className="font-display font-bold text-[11px] sm:text-xs text-orange-950 dark:text-orange-200 block leading-tight">
                          DESENVOLV. DE PRODUTOS
                        </span>
                      </div>
                    </div>

                    {/* Seta horizontal conectando PCP até DESENVOLV DE PRODUTOS via SVG */}
                    <div className="col-span-4 relative h-10 flex items-center">
                      <svg
                        className="w-full h-full text-foreground/70"
                        viewBox="0 0 400 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {/* Seta saindo de PCP (coluna 2, x ~= 40) subindo e virando para DESENVOLV DE PRODUTOS (x=0) */}
                        <path d="M 50 35 L 50 15 L 2 15" markerEnd="url(#arrowhead)" />
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="6"
                            markerHeight="6"
                            refX="4"
                            refY="3"
                            orient="auto"
                          >
                            <polygon points="0 0, 6 3, 0 6" fill="currentColor" />
                          </marker>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Fluxo Principal Horizontal: COMERCIAL ↔ PCP → PRODUÇÃO → EXPEDIÇÃO */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center">
                    {/* 1. COMERCIAL */}
                    <div className="rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 p-2.5 text-center shadow-sm">
                      <span className="font-display font-bold text-xs text-orange-950 dark:text-orange-200 block leading-tight">
                        COMERCIAL
                      </span>
                    </div>

                    {/* Seta Bidirecional Comercial ↔ PCP */}
                    <div className="flex items-center justify-center">
                      <span className="text-foreground/70 font-bold text-lg">⇄</span>
                    </div>

                    {/* 2. PCP */}
                    <div className="rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 p-2.5 text-center shadow-sm">
                      <span className="font-display font-bold text-xs text-orange-950 dark:text-orange-200 block leading-tight">
                        PCP
                      </span>
                    </div>

                    {/* Seta PCP → PRODUÇÃO */}
                    <div className="flex items-center justify-center">
                      <span className="text-foreground/70 font-bold text-lg">→</span>
                    </div>

                    {/* 3. PRODUÇÃO */}
                    <div className="rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 p-2.5 text-center shadow-sm">
                      <span className="font-display font-bold text-xs text-orange-950 dark:text-orange-200 block leading-tight">
                        PRODUÇÃO
                      </span>
                    </div>
                  </div>

                  {/* Linha com EXPEDIÇÃO e conexões com SUPRIMENTOS/ALMOXARIFADO */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center pt-2">
                    <div className="col-span-2" />

                    {/* SUPRIMENTOS / ALMOXARIFADO (abaixo de PCP/PRODUÇÃO) */}
                    <div className="col-span-2 rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 p-2 text-center shadow-sm">
                      <span className="font-display font-bold text-[11px] sm:text-xs text-orange-950 dark:text-orange-200 block leading-tight">
                        SUPRIMENTOS / ALMOXARIFADO
                      </span>
                    </div>

                    {/* EXPEDIÇÃO (final do fluxo principal à direita) */}
                    <div className="col-span-1 rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 p-2.5 text-center shadow-sm">
                      <span className="font-display font-bold text-xs text-orange-950 dark:text-orange-200 block leading-tight">
                        EXPEDIÇÃO
                      </span>
                    </div>
                  </div>

                  {/* Svg Conectores entre PCP, Suprimentos, Produção e Expedição */}
                  <div className="relative h-12 w-full">
                    <svg
                      className="w-full h-full text-foreground/70 overflow-visible"
                      viewBox="0 0 600 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {/* Linha vertical bidirecional entre PCP e Suprimentos */}
                      <line x1="280" y1="0" x2="280" y2="25" />
                      <line x1="280" y1="0" x2="276" y2="6" />
                      <line x1="280" y1="0" x2="284" y2="6" />
                      <line x1="280" y1="25" x2="276" y2="19" />
                      <line x1="280" y1="25" x2="284" y2="19" />

                      {/* Linha de Suprimentos para Expedição */}
                      <path d="M 420 15 L 530 15 L 530 0" markerEnd="url(#arrowhead2)" />
                      <defs>
                        <marker
                          id="arrowhead2"
                          markerWidth="6"
                          markerHeight="6"
                          refX="4"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 6 3, 0 6" fill="currentColor" />
                        </marker>
                      </defs>
                    </svg>
                  </div>

                  {/* Rodapé do diagrama: Apoio (GESTÃO DE PESSOAS e INFRAESTRUTURA) */}
                  <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-muted text-xs font-bold text-foreground">
                      Apoio:
                    </div>
                    <div className="rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 px-4 py-2 text-center shadow-xs">
                      <span className="font-display font-bold text-xs text-orange-950 dark:text-orange-200">
                        GESTÃO DE PESSOAS
                      </span>
                    </div>
                    <div className="rounded-lg bg-[#fed7aa] dark:bg-orange-950/60 border-2 border-[#fb923c] dark:border-orange-600 px-4 py-2 text-center shadow-xs">
                      <span className="font-display font-bold text-xs text-orange-950 dark:text-orange-200">
                        INFRAESTRUTURA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: SATISFAÇÃO DO CLIENTE (barra vertical azulada) */}
                <div className="col-span-1 bg-[#bae6fd] dark:bg-sky-950/50 border border-[#38bdf8] dark:border-sky-700 rounded-lg flex items-center justify-center py-6 shadow-sm">
                  <span
                    className="font-display font-extrabold text-[11px] sm:text-xs text-sky-950 dark:text-sky-200 tracking-wider uppercase select-none"
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    SATISFAÇÃO DO CLIENTE
                  </span>
                </div>
              </div>

              {/* Barra Inferior: MONITORAMENTO / MEDIÇÃO / ANÁLISE DE RESULTADOS */}
              <div className="w-full bg-[#86efac] dark:bg-emerald-900/60 border border-[#4ade80] dark:border-emerald-600 rounded-lg py-2.5 px-4 text-center shadow-sm mt-3">
                <span className="font-display font-extrabold text-xs sm:text-sm tracking-widest uppercase text-emerald-950 dark:text-emerald-100">
                  MONITORAMENTO / MEDIÇÃO / ANÁLISE DE RESULTADOS
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to action comercial / suporte técnico */}
      <section className="rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge className="bg-accent text-accent-foreground font-display font-bold px-3 py-1 rounded-full">
            Suporte Técnico & Qualidade
          </Badge>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            Precisa de laudos técnicos, fichas de produto ou especificações de controle?
          </h3>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Nosso setor de garantia da qualidade está à disposição para fornecer documentação
            técnica, amostras para testes em planta e atendimento personalizado.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-dark text-accent-foreground font-display font-bold rounded-xl shadow-md"
            >
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                Falar com a Qualidade no WhatsApp
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
            >
              <Link to="/contato">Enviar Mensagem pelo Site</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
