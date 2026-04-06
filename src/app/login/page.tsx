"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@/firebase";
import { 
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles, Chrome, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { generateWelcomeEmail } from "@/ai/flows/ai-welcome-email-flow";
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * @fileOverview Pantalla de inicio de sesión con flujo de redirección blindado.
 * Evita el bucle de regreso al login mediante estados de carga atómicos.
 */
export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const processingRef = useRef(false);

  // 1. Manejar el resultado del redireccionamiento de Google al montar el componente
  useEffect(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Si hay un usuario del redireccionamiento, vamos a la despensa
          router.replace("/pantry");
          return;
        }
      } catch (error: any) {
        console.error("Auth redirect error:", error);
        if (error.code === 'auth/unauthorized-domain') {
          setAuthError("Dominio no autorizado. Debes añadir 'food-ai-mvp.vercel.app' en la sección 'Authorized domains' de la consola de Firebase.");
        } else {
          setAuthError(error.message);
        }
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    checkRedirect();
  }, [auth, router]);

  // 2. Si el estado global del usuario cambia y ya está logueado, redirigir inmediatamente
  useEffect(() => {
    if (user && !isUserLoading && !isProcessingRedirect) {
      router.replace("/pantry");
    }
  }, [user, isUserLoading, isProcessingRedirect, router]);

  // --- FUNCIÓN MODIFICADA A POPUP ---
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    // Forzamos la selección de cuenta para evitar logueos automáticos fallidos
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        router.replace("/pantry");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      setAuthError(error.message);
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
      setAuthError(error.message);
      setLoading(false);
    }
  };

  // Mientras se procesa el redireccionamiento o se carga el usuario, no mostramos nada más que el cargador
  if (isUserLoading || isProcessingRedirect || (user && !isUserLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-accent animate-pulse" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary animate-pulse">
          Sincronizando con FoodAI...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-8 px-4 pb-20 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg mb-4 animate-float">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-primary">FoodAI</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-70">
          Tu despensa, evolucionada.
        </p>
      </div>

      {authError && (
        <Alert variant="destructive" className="max-w-md bg-destructive/10 border-destructive text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-black uppercase tracking-tight">Error de Acceso</AlertTitle>
          <AlertDescription className="text-[10px] leading-relaxed">
            {authError}
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md glass border-none shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <CardHeader className="p-8 pb-4 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            {isRegistering ? "Únete a FoodAI" : "Gestiona tu despensa"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 font-bold flex items-center justify-center gap-3 hover:bg-primary/5 transition-all"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-primary" />}
            Continuar con Google
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted/20"></span></div>
            <div className="relative flex justify-center text-[9px] uppercase font-bold text-muted-foreground bg-background px-4">
              <span>O usa tu correo</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input type="email" placeholder="Correo" className="h-12 rounded-2xl bg-white/50 dark:bg-black/20" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Contraseña" className="h-12 rounded-2xl bg-white/50 dark:bg-black/20" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl neo-glow-primary" onClick={handleEmailAuth} disabled={loading || googleLoading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRegistering ? "Registrarse" : "Entrar")}
          </Button>
          
          <Button variant="link" className="w-full text-primary font-bold text-[10px] uppercase tracking-wider" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "¿Ya tienes cuenta? Entra" : "¿No tienes cuenta? Regístrate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}