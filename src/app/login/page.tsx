
"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Loader2, Sparkles, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { generateWelcomeEmail } from "@/ai/flows/ai-welcome-email-flow";

/**
 * @fileOverview Pantalla de inicio de sesión simplificada: Exclusivamente Correo y Contraseña.
 */
export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ 
        title: "Datos incompletos", 
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
          // Generar mensaje de bienvenida con Gemini 2.5 Flash
          const welcomeMsg = await generateWelcomeEmail({
            email: email,
            language: language
          });
          toast({ 
            title: "¡Cuenta creada!", 
            description: `Bienvenido Chef. Hemos preparado una sorpresa: "${welcomeMsg.subject}"`,
          });
        } catch (aiErr) {
          toast({ title: "¡Cuenta creada!", description: "Bienvenido a FoodAI." });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "¡Hola de nuevo!", description: "Has iniciado sesión correctamente." });
      }
      router.push("/");
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/invalid-credential') message = "Correo o contraseña incorrectos.";
      if (error.code === 'auth/email-already-in-use') message = "Este correo ya está registrado.";
      
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] space-y-6 animate-in fade-in duration-1000 px-4">
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
            <Button className="w-full h-14 rounded-2xl font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary" onClick={handleEmailAuth} disabled={loading}>
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
