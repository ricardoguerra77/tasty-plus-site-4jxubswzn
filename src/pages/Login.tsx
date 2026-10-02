import { useState, type FormEvent, type JSX } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { useAuth, getAuthErrorMessage } from '@/hooks/useAuth'
import { validateEmail, validateRequired } from '@/lib/validation'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Login(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, isValid, user, logout, requestPasswordReset } = useAuth()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Forgot password flow states
  const [isForgotMode, setIsForgotMode] = useState<boolean>(false)
  const [resetEmail, setResetEmail] = useState<string>('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [resetSubmitted, setResetSubmitted] = useState<boolean>(false)

  // Determine post-login redirect path
  const targetPath = (location.state as { from?: string } | null)?.from || '/admin'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setGeneralError(null)

    // Form client-side validation
    const emailError = validateEmail(email)
    const passwordError = validateRequired(password, 'Senha')

    if (emailError || passwordError) {
      setFormErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      })
      toast({
        variant: 'destructive',
        title: 'Dados incompletos',
        description: 'Por favor, preencha corretamente os campos obrigatórios.',
      })
      return
    }

    setFormErrors({})

    try {
      const loggedProfile = await login({ email, password })
      toast({
        title: 'Login efetuado com sucesso',
        description: `Bem-vindo(a), ${loggedProfile.name || 'usuário'}!`,
      })

      // If user is editor trying to go to /admin root (which is admin-only), redirect to /admin/noticias
      if (loggedProfile.role === 'editor' && targetPath === '/admin') {
        navigate('/admin/noticias', { replace: true })
      } else {
        navigate(targetPath, { replace: true })
      }
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err)
      setGeneralError(message)

      // Distinctive toasts according to error nature
      const isNetworkErr =
        message.toLowerCase().includes('conectar') || message.toLowerCase().includes('conexão')
      toast({
        variant: 'destructive',
        title: isNetworkErr ? 'Falha de conexão' : 'Erro de autenticação',
        description: message,
      })
    }
  }

  const handleForgotPasswordSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setResetError(null)

    const emailErr = validateEmail(resetEmail)
    if (emailErr) {
      setResetError(emailErr)
      return
    }

    setIsResetting(true)
    try {
      await requestPasswordReset(resetEmail)
      setResetSubmitted(true)
      toast({
        title: 'Solicitação enviada',
        description: 'Se este e-mail estiver cadastrado, enviaremos as instruções de redefinição.',
      })
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message.toLowerCase() : ''
      const isNetworkErr =
        rawMsg.includes('failed to fetch') ||
        rawMsg.includes('network') ||
        rawMsg.includes('conexão') ||
        rawMsg.includes('conectar')
      const isSmtpErr =
        rawMsg.includes('smtp') ||
        rawMsg.includes('mail') ||
        rawMsg.includes('email') ||
        rawMsg.includes('send')

      if (isNetworkErr) {
        toast({
          variant: 'destructive',
          title: 'Falha de conexão',
          description:
            'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
        })
      } else if (isSmtpErr) {
        toast({
          variant: 'destructive',
          title: 'Serviço de e-mail indisponível',
          description:
            'O serviço de envio de e-mails não está configurado. Por favor, contate o administrador do sistema.',
        })
      } else {
        // Generic safe message (or fallback)
        toast({
          title: 'Solicitação enviada',
          description:
            'Se este e-mail estiver cadastrado, enviaremos as instruções de redefinição.',
        })
        setResetSubmitted(true)
      }
    } finally {
      setIsResetting(false)
    }
  }

  // If already logged in, provide quick access to admin panel or logout option
  if (isValid && user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Sessão Ativa</CardTitle>
            <CardDescription>
              Você já está autenticado como <strong>{user.name}</strong> (
              {user.role === 'admin' ? 'Administrador' : 'Editor'}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/admin/noticias')}
            >
              <span>Acessar Painel</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => logout()}>
              Encerrar Sessão
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-border">
        {!isForgotMode ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Acesso Restrito</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o painel administrativo da Tasty Aromas e
                Sabores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@tastyplus.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-destructive">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true)
                        setResetEmail(email)
                        setResetError(null)
                        setResetSubmitted(false)
                      }}
                      className="text-xs text-primary hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-destructive">{formErrors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer font-semibold min-h-[44px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border pt-4">
              <p className="text-xs text-muted-foreground text-center">
                Acesso exclusivo para administradores e editores autorizados.
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Redefinir Senha</CardTitle>
              <CardDescription>
                Informe seu e-mail cadastrado para enviarmos o link de recuperação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSubmitted ? (
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Solicitação Enviada</h3>
                    <p className="text-sm text-muted-foreground">
                      Se este e-mail estiver cadastrado, enviaremos as instruções de redefinição.
                      Verifique sua caixa de entrada e pasta de spam.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px] cursor-pointer mt-2"
                    onClick={() => {
                      setIsForgotMode(false)
                      setResetSubmitted(false)
                    }}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">E-mail Cadastrado</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu.email@tastyplus.com.br"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value)
                          if (resetError) setResetError(null)
                        }}
                        className="pl-9"
                        disabled={isResetting}
                        autoComplete="email"
                        required
                      />
                    </div>
                    {resetError && <p className="text-xs text-destructive">{resetError}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full cursor-pointer font-semibold min-h-[44px]"
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Instruções'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full min-h-[44px] cursor-pointer flex items-center justify-center gap-2"
                    disabled={isResetting}
                    onClick={() => {
                      setIsForgotMode(false)
                      setResetError(null)
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar ao formulário de login</span>
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border pt-4">
              <p className="text-xs text-muted-foreground text-center">
                Precisa de ajuda imediata? Contate o administrador do sistema.
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
