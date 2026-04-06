
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@/firebase";
import { 
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Loader2, Sparkles, UserPlus, LogIn, Chrome, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { generateWelcomeEmail } from "@/ai/flows/ai-welcome-email-flow";
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login";

/**
 * @fileOverview Pantalla de inicio de sesión optimizada.
 * Implementa el método de redirección atómica para evitar bucles en móviles.
 */
export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const hasProcessedRedirect = useRef(false);

  // EFECTO DE REDIRECCIÓN FORZADA: Si hay usuario, vamos a pantry inmediatamente.
  useEffect(() => {
    if (user && !isUserLoading) {
      console.log("User detected, redirecting to /pantry...");
      router.replace("/pantry");
    }
  }, [user, isUserLoading, router]);

  // Manejar el resultado del redireccionamiento de Google
  useEffect(() => {
    const handleRedirect = async () => {
      if (hasProcessedRedirect.current) return;
      
      try {
        setGoogleLoading(true);
        const result = await getRedirectResult(auth);
        hasProcessedRedirect.current = true;

        if (result?.user) {
          const isNewUser = (result as any)._tokenResponse?.isNewUser;
          if (isNewUser && result.user.email) {
            try {
              await generateWelcomeEmail({
                email: result.user.email,
                displayName: result.user.displayName || "Chef",
                language: language
              });
            } catch (aiErr) {
              console.error("Welcome email error:", aiErr);
            }
          }
          toast({ 
            title: language === 'english' ? "Welcome!" : "¡Bienvenido!", 
            description: language === 'english' ? "Logged in with Google." : "Iniciaste sesión con Google." 
          });
          // La redirección ocurrirá automáticamente por el primer useEffect
        }
      } catch (error: any) {
        console.error("Auth Redirect Error:", error);
        if (error.code === 'auth/unauthorized-domain') {
          setAuthError("Dominio no autorizado. Añade este dominio en la Consola de Firebase > Authentication > Settings.");
        } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-closure-redirect') {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } finally {
        setGoogleLoading(false);
      }
    };

    handleRedirect();
  }, [auth, language, toast]);

  const handleGoogleAuth = async () => {
    if (googleLoading || loading) return;
    setGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ title: "Datos incompletos", description: "Llena todos los campos.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      if (isRegistering) {
        initiateEmailSignUp(auth, email, password);
        try { await generateWelcomeEmail({ email, language }); } catch (e) {}
      } else {
        initiateEmailSignIn(auth, email, password);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-8 animate-in fade-in duration-1000 px-4 pb-20">
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary neo-glow animate-float mb-4 shadow-[0_0_30px_rgba(var(--primary),0.5)]">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-primary">
          Food<span className="text-secondary">AI</span>
        </h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
          {t('login.subtitle')}
        </p>
      </div>

      {(authError || googleLoading) && (
        <Card className="w-full max-w-md bg-primary/5 border-primary/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top">
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          )}
          <p className="text-xs font-bold text-foreground leading-tight">
            {googleLoading ? "Confirmando identidad..." : authError}
          </p>
        </Card>
      )}

      <Card className="w-full max-w-md glass overflow-hidden border-none shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <CardHeader className="p-8 pb-4 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">
            {isRegistering ? "Únete al futuro de la cocina" : "Gestiona tu despensa inteligente"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl border-2 font-bold flex items-center justify-center gap-3 hover:bg-primary/5 transition-all"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-primary" />}
            {language === 'english' ? "Continue with Google" : "Continuar con Google"}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/20"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground/60 bg-background px-2">
              <span>{language === 'english' ? "Or use email" : "O usa tu correo"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input type="email" placeholder={t('login.emailPlaceholder')} className="h-12 rounded-2xl border-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder={t('login.passwordPlaceholder')} className="h-12 rounded-2xl border-2" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <Button className="w-full h-14 rounded-2xl font-bold text-base shadow-lg bg-primary" onClick={handleEmailAuth} disabled={loading || googleLoading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRegistering ? t('login.registerBtn') : t('login.loginBtn'))}
          </Button>
          
          <Button variant="link" className="w-full text-primary font-bold text-[10px] uppercase tracking-wider" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? t('login.switchLogin') : t('login.switchRegister')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
