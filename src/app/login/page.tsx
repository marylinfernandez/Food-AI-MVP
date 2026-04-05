
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Loader2, Sparkles, UserPlus, LogIn, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { generateWelcomeEmail } from "@/ai/flows/ai-welcome-email-flow";

/**
 * @fileOverview Pantalla de inicio de sesión optimizada para móviles.
 * Usa Redirect para máxima compatibilidad y maneja el resultado de forma atómica.
 */
export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Ref para asegurar que getRedirectResult solo se procese una vez por ciclo de vida
  const processingRedirect = useRef(false);

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    if (user && !googleLoading && !loading) {
      router.push("/pantry");
    }
  }, [user, router, googleLoading, loading]);

  // Procesar el resultado del redireccionamiento de Google de forma segura
  useEffect(() => {
    if (processingRedirect.current) return;

    const checkRedirectResult = async () => {
      try {
        setGoogleLoading(true);
        const result = await getRedirectResult(auth);
        
        if (result && !processingRedirect.current) {
          processingRedirect.current = true;
          
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
          router.push("/pantry");
        }
      } catch (error: any) {
        console.error("Auth Redirect Error:", error);
        // El error 'auth/argument-error' suele ser benigno si no hubo un redirect previo
        if (error.code !== 'auth/argument-error' && error.code !== 'auth/operation-not-allowed') {
          toast({ 
            title: "Error de Acceso", 
            description: "No se pudo completar el acceso. Intenta de nuevo.", 
            variant: "destructive" 
          });
        }
      } finally {
        setGoogleLoading(false);
      }
    };

    checkRedirectResult();
  }, [auth, router, language, toast]);

  const handleGoogleAuth = async () => {
    if (googleLoading || loading) return;
    
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      // Método Redirect: Infalible en móviles y PWAs
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Init Error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ 
        title: language === 'english' ? "Incomplete data" : "Datos incompletos", 
        description: "Por favor llena todos los campos.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        try {
          await generateWelcomeEmail({ email, language });
        } catch (aiErr) {
          console.error("Welcome email error:", aiErr);
        }
        toast({ 
          title: language === 'english' ? "Account created!" : "¡Cuenta creada!", 
          description: "Bienvenido a FoodAI." 
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ 
          title: language === 'english' ? "Welcome back!" : "¡Hola de nuevo!", 
          description: "Has iniciado sesión correctamente." 
        });
      }
      router.push("/pantry");
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/invalid-credential') {
        message = "Correo o contraseña incorrectos.";
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
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
          <div className="space-y-4">
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
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground/60 bg-transparent px-2">
                <span className="bg-background px-2">{language === 'english' ? "Or use email" : "O usa tu correo"}</span>
              </div>
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="email" 
                placeholder={t('login.emailPlaceholder')}
                className="h-12 pl-12 rounded-2xl border-2 focus:ring-primary focus:border-primary transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="password" 
                placeholder={t('login.passwordPlaceholder')}
                className="h-12 pl-12 rounded-2xl border-2 focus:ring-primary focus:border-primary transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button className="w-full h-14 rounded-2xl font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary" onClick={handleEmailAuth} disabled={loading || googleLoading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                isRegistering ? (
                  <><UserPlus className="h-5 w-5 mr-2" /> {t('login.registerBtn')}</>
                ) : (
                  <><LogIn className="h-5 w-5 mr-2" /> {t('login.loginBtn')}</>
                )
              )}
            </Button>
            
            <Button variant="link" className="w-full text-primary font-bold text-[10px] uppercase tracking-wider" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? t('login.switchLogin') : t('login.switchRegister')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-[10px] text-muted-foreground/60 text-center max-w-xs leading-relaxed uppercase tracking-widest px-4">
        {t('login.footer')}
      </p>
    </div>
  );
}
