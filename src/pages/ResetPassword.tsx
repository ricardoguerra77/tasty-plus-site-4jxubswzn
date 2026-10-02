import { useState, type FormEvent, type JSX } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react'
import { useAuth, getAuthErrorMessage } from '@/hooks/useAuth'
import { validatePassword, validatePasswordMatch } from '@/lib/validation'
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

export default function ResetPassword(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = (searchParams.get('token') || '').trim()

  const { confirmPasswordReset, isLoading } = useAuth()

  const [password, setPassword] = useState<string>('')
  const [passwordConfirm, setPasswordConfirm] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false)

  const [formErrors, setFormErrors] = useState<{
    password?: string
    passwordConfirm?: string
  }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // 1. Missing or empty token state
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Link Inválido ou Expirado
            </CardTitle>
            <CardDescription>
              O token de redefinição de senha não foi fornecido ou este link já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Para redefinir sua senha com segurança, acesse a tela de login e solicite um novo link
              de recuperação de senha.
            </p>
            <Button asChild className="w-full min-h-[44px] cursor-pointer font-semibold">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ir para o Login
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border pt-4">
            <p className="text-xs text-muted-foreground text-center">
              Tasty Aromas e Sabores — A fórmula certa para a sua empresa.
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 2. Success state
  if (isSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-300">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Senha Redefinida!</CardTitle>
            <CardDescription>Sua nova senha foi atualizada com sucesso no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Você já pode entrar utilizando seu e-mail e a nova senha cadastrada. Redirecionando
              para o login em instantes...
            </p>
            <Button
              className="w-full min-h-[44px] cursor-pointer font-semibold"
              onClick={() => navigate('/login', { replace: true })}
            >
              Entrar Agora
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border pt-4">
            <p className="text-xs text-muted-foreground text-center">
              Tasty Aromas e Sabores — Gestão de Acesso Seguro.
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setSubmitError(null)

    // Client-side validations
    const passErr = validatePassword(password)
    const matchErr = validatePasswordMatch(password, passwordConfirm)

    if (passErr || matchErr) {
      setFormErrors({
        password: passErr || undefined,
        passwordConfirm: matchErr || undefined,
      })
      toast({
        variant: 'destructive',
        title: 'Verifique os dados informados',
        description: passErr || matchErr || 'Por favor, revise os campos do formulário.',
      })
      return
    }

    setFormErrors({})

    try {
      await confirmPasswordReset(token, password)
      setIsSuccess(true)
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Agora você pode entrar com sua nova senha.',
      })
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2500)
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err)
      setSubmitError(message)
      toast({
        variant: 'destructive',
        title: 'Falha ao redefinir senha',
        description: message,
      })
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Criar Nova Senha</CardTitle>
          <CardDescription>
            Defina uma nova senha de acesso para sua conta na Tasty Aromas e Sabores.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitError && (
            <div className="mb-4 space-y-3">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
              <div className="text-center">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Solicitar nova recuperação de senha
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo de 8 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (formErrors.password) {
                      setFormErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  className="pl-9 pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-destructive">{formErrors.password}</p>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  name="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Repita sua nova senha"
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value)
                    if (formErrors.passwordConfirm) {
                      setFormErrors((prev) => ({ ...prev, passwordConfirm: undefined }))
                    }
                  }}
                  className="pl-9 pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  aria-label={showPasswordConfirm ? 'Ocultar confirmação' : 'Exibir confirmação'}
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formErrors.passwordConfirm && (
                <p className="text-xs text-destructive">{formErrors.passwordConfirm}</p>
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
                  Salvando nova senha...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              asChild
              className="w-full min-h-[44px] cursor-pointer flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Link to="/login">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao login</span>
              </Link>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            A senha deve conter no mínimo 8 caracteres para garantir a segurança da conta.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
