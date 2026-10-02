import { useState, type JSX } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabGeneralSettings } from '@/components/admin/TabGeneralSettings'
import { TabProducts } from '@/components/admin/TabProducts'
import { TabRepresentatives } from '@/components/admin/TabRepresentatives'
import { TabNews } from '@/components/admin/TabNews'
import { TabUsers } from '@/components/admin/TabUsers'
import { useAuth } from '@/hooks/useAuth'
import { Settings, Package, Users, Newspaper, UserCog } from 'lucide-react'

export default function Admin(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('configuracoes')
  const { isSuperAdmin } = useAuth()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Painel de Administração
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o conteúdo institucional, catálogo de produtos, representantes e notícias da
          Tasty Aromas e Sabores.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList
          className={`grid w-full ${
            isSuperAdmin ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'
          } h-auto p-1 bg-muted/60`}
        >
          <TabsTrigger
            value="configuracoes"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4" />
            <span>Configurações Gerais</span>
          </TabsTrigger>
          <TabsTrigger
            value="produtos"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Package className="h-4 w-4" />
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger
            value="representantes"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4" />
            <span>Representantes</span>
          </TabsTrigger>
          <TabsTrigger
            value="noticias"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Newspaper className="h-4 w-4" />
            <span>Notícias</span>
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger
              value="usuarios"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UserCog className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="configuracoes" className="mt-4 focus-visible:outline-none">
          <TabGeneralSettings />
        </TabsContent>

        <TabsContent value="produtos" className="mt-4 focus-visible:outline-none">
          <TabProducts />
        </TabsContent>

        <TabsContent value="representantes" className="mt-4 focus-visible:outline-none">
          <TabRepresentatives />
        </TabsContent>

        <TabsContent value="noticias" className="mt-4 focus-visible:outline-none">
          <TabNews />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="usuarios" className="mt-4 focus-visible:outline-none">
            <TabUsers />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
