
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
import { Loader2, Sparkles, Chrome, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { generateWelcomeEmail } from "@/ai/flows/ai-welcome-email-flow";
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  useEffect(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          router.replace("/pantry");
          return;
        }
      } catch (error: any) {
        console.error("Auth redirect error:", error);
        if (error.code === 'auth/unauthorized-domain') {
          setAuthError("Dominio no autorizado. Añade 'food-ai-mvp.vercel.app' en la consola de Firebase (Authentication > Settings > Authorized domains).");
        } else {
          setAuthError(error.message);
        }
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    checkRedirect();
  }, [auth, router]);

  useEffect(() => {
    if (user && !isUserLoading && !isProcessingRedirect) {
      router.replace("/pantry");
    }
  }, [user, isUserLoading, isProcessingRedirect, router]);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithRedirect(auth, provider);
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

  if (isUserLoading || isProcessingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">
          Verificando acceso...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-8 px-4 pb-20">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg mb-4">
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
          <AlertTitle>Error de Acceso</AlertTitle>
          <AlertDescription className="text-xs">
            {authError}
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md glass border-none shadow-2xl">
        <CardHeader className="p-8 pb-4 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">
            {isRegistering ? "Únete a FoodAI" : "Gestiona tu despensa"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl border-2 font-bold flex items-center justify-center gap-3"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5 text-primary" />}
            Continuar con Google
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted/20"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground bg-background px-2">
              <span>O usa tu correo</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input type="email" placeholder="Correo" className="h-12 rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Contraseña" className="h-12 rounded-2xl" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <Button className="w-full h-14 rounded-2xl font-bold" onClick={handleEmailAuth} disabled={loading || googleLoading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRegistering ? "Registrarse" : "Entrar")}
          </Button>
          
          <Button variant="link" className="w-full text-primary font-bold text-[10px] uppercase" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "¿Ya tienes cuenta? Entra" : "¿No tienes cuenta? Regístrate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
