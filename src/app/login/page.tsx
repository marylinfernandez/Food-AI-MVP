
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Chrome, Facebook, Twitter, Phone, Instagram, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Phone auth states
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'twitter' | 'instagram') => {
    setLoading(true);
    let provider;
    
    switch (providerName) {
      case 'google': provider = new GoogleAuthProvider(); break;
      case 'facebook': provider = new FacebookAuthProvider(); break;
      case 'twitter': provider = new TwitterAuthProvider(); break;
      case 'instagram': provider = new OAuthProvider('instagram.com'); break;
      default: provider = new GoogleAuthProvider();
    }

    try {
      // Firebase signInWithPopup handles both registration and login automatically
      await signInWithPopup(auth, provider);
      toast({ title: "¡Acceso Exitoso!", description: "Bienvenido de nuevo a PantryPal AI." });
      router.push("/");
    } catch (error: any) {
      toast({ 
        title: "Error de conexión", 
        description: "No pudimos conectar con " + providerName + ". Revisa tu conexión.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ title: "Datos incompletos", description: "Por favor llena todos los campos.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "¡Cuenta creada!", description: "Bienvenido a la cocina del futuro." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "¡Hola de nuevo!", description: "Has iniciado sesión correctamente." });
      }
      router.push("/");
    } catch (error: any) {
      let message = "Ocurrió un error inesperado.";
      if (error.code === 'auth/user-not-found') message = "No existe una cuenta con este correo.";
      if (error.code === 'auth/wrong-password') message = "La contraseña es incorrecta.";
      if (error.code === 'auth/email-already-in-use') message = "Este correo ya está registrado.";
      
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      toast({ title: "Código enviado", description: "Revisa tus mensajes SMS." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast({ title: "¡Éxito!", description: "Teléfono verificado." });
      router.push("/");
    } catch (error: any) {
      toast({ title: "Código inválido", description: "El código ingresado no es correcto.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[95vh] space-y-6 animate-in fade-in duration-1000 px-4">
      <div id="recaptcha-container"></div>
      
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary neo-glow animate-float mb-4 shadow-[0_0_30px_rgba(var(--primary),0.5)]">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tighter text-primary">
          PantryPal <span className="text-secondary">AI</span>
        </h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em] opacity-70">
          Tu despensa, evolucionada.
        </p>
      </div>

      <Card className="w-full max-w-md glass overflow-hidden border-none shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        
        {showPhoneInput ? (
          <CardContent className="p-8 space-y-6">
            <Button variant="ghost" className="mb-2 p-0 h-auto hover:bg-transparent" onClick={() => setShowPhoneInput(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
            <h2 className="text-2xl font-bold">Acceso por Teléfono</h2>
            {!confirmationResult ? (
              <div className="space-y-4">
                <Input 
                  placeholder="+34 600 000 000" 
                  className="h-14 rounded-2xl border-2 text-lg"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button className="w-full h-14 rounded-2xl font-bold" onClick={handleSendCode} disabled={loading}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Enviar Código SMS"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input 
                  placeholder="Código de 6 dígitos" 
                  className="h-14 rounded-2xl border-2 text-center text-2xl tracking-[0.5em]"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button className="w-full h-14 rounded-2xl font-bold bg-accent text-white" onClick={handleVerifyCode} disabled={loading}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verificar e Iniciar"}
                </Button>
              </div>
            )}
          </CardContent>
        ) : (
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none h-16 bg-secondary/5 border-b border-white/10">
              <TabsTrigger value="social" className="data-[state=active]:bg-white/40 data-[state=active]:text-primary font-bold transition-all">
                Social
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-white/40 data-[state=active]:text-primary font-bold transition-all">
                Correo
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="p-8">
              <TabsContent value="social" className="space-y-4 mt-0 animate-in slide-in-from-left-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/10 group transition-all" onClick={() => handleSocialLogin('google')} disabled={loading}>
                    <Chrome className="h-5 w-5 mr-2 text-red-500 group-hover:scale-110 transition-transform" /> Google
                  </Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/10 group transition-all" onClick={() => handleSocialLogin('facebook')} disabled={loading}>
                    <Facebook className="h-5 w-5 mr-2 text-blue-600 group-hover:scale-110 transition-transform" /> Facebook
                  </Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/10 group transition-all" onClick={() => handleSocialLogin('twitter')} disabled={loading}>
                    <Twitter className="h-5 w-5 mr-2 text-sky-500 group-hover:scale-110 transition-transform" /> X / Twitter
                  </Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/10 group transition-all" onClick={() => handleSocialLogin('instagram')} disabled={loading}>
                    <Instagram className="h-5 w-5 mr-2 text-pink-600 group-hover:scale-110 transition-transform" /> Instagram
                  </Button>
                </div>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-muted-foreground">O también</span></div>
                </div>

                <Button variant="secondary" className="w-full h-14 rounded-2xl font-bold bg-white/50 border border-white/20 hover:bg-white/70" onClick={() => setShowPhoneInput(true)} disabled={loading}>
                  <Phone className="h-5 w-5 mr-2 text-primary" /> Número de Teléfono
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4 mt-0 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      placeholder="Correo electrónico" 
                      className="h-14 pl-12 rounded-2xl border-2 focus:ring-primary focus:border-primary transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="Contraseña" 
                      className="h-14 pl-12 rounded-2xl border-2 focus:ring-primary focus:border-primary transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={handleEmailAuth} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    isRegistering ? "Crear Nueva Cuenta" : "Entrar a mi Despensa"
                  )}
                </Button>
                
                <Button variant="link" className="w-full text-primary font-medium" onClick={() => setIsRegistering(!isRegistering)}>
                  {isRegistering ? "¿Ya tienes una cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
                </Button>
              </TabsContent>
            </CardContent>
          </Tabs>
        )}
      </Card>
      
      <p className="text-[10px] text-muted-foreground/60 text-center max-w-xs leading-relaxed uppercase tracking-widest">
        Al acceder, entras en un ecosistema de gestión inteligente de alimentos. 
        Tus datos están protegidos por encriptación cuántica simulada.
      </p>
    </div>
  );
}
