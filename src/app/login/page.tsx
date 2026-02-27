"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider,
  OAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Chrome, Facebook, Instagram, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { generateWelcomeEmail } from "@/ai/flows/ai-welcome-email-flow";

/**
 * @fileOverview Pantalla de inicio de sesión optimizada con sincronización social e IA.
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

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'twitter' | 'instagram') => {
    setLoading(true);
    let provider;
    
    switch (providerName) {
      case 'google': 
        provider = new GoogleAuthProvider(); 
        provider.setCustomParameters({ prompt: 'select_account' });
        break;
      case 'facebook': 
        provider = new FacebookAuthProvider(); 
        break;
      case 'twitter': 
        provider = new TwitterAuthProvider(); 
        break;
      case 'instagram': 
        provider = new OAuthProvider('instagram.com'); 
        break;
      default: 
        provider = new GoogleAuthProvider();
    }

    try {
      await signInWithPopup(auth, provider);
      toast({ title: "¡Acceso Exitoso!", description: "Bienvenido a FoodAI." });
      router.push("/");
    } catch (error: any) {
      toast({ 
        title: "Error de conexión", 
        description: "No pudimos conectar con " + providerName, 
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
        
        try {
          const welcomeMsg = await generateWelcomeEmail({
            email: email,
            language: language
          });
          toast({ 
            title: "¡Cuenta creada!", 
            description: `Bienvenido Chef. Hemos preparado tu mensaje de bienvenida: "${welcomeMsg.subject}"`,
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-secondary/5 border-b border-white/10">
            <TabsTrigger value="social" className="data-[state=active]:bg-white/40 data-[state=active]:text-primary font-bold transition-all text-xs uppercase tracking-widest">
              {t('login.socialTab')}
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-white/40 data-[state=active]:text-primary font-bold transition-all text-xs uppercase tracking-widest">
              {t('login.emailTab')}
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="p-8">
            <TabsContent value="social" className="space-y-4 mt-0 animate-in slide-in-from-left-4 duration-300">
              <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t('login.joinVia')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 rounded-2xl border-2 hover:bg-primary/10 group transition-all text-xs font-bold" onClick={() => handleSocialLogin('google')} disabled={loading}>
                  <Chrome className="h-4 w-4 mr-2 text-red-500 group-hover:scale-110 transition-transform" /> GOOGLE
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl border-2 hover:bg-primary/10 group transition-all text-xs font-bold" onClick={() => handleSocialLogin('facebook')} disabled={loading}>
                  <Facebook className="h-4 w-4 mr-2 text-blue-600 group-hover:scale-110 transition-transform" /> FACEBOOK
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl border-2 hover:bg-primary/10 group transition-all text-xs font-bold" onClick={() => handleSocialLogin('twitter')} disabled={loading}>
                  <svg className="h-4 w-4 mr-2 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                  </svg>
                  X
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl border-2 hover:bg-primary/10 group transition-all text-xs font-bold" onClick={() => handleSocialLogin('instagram')} disabled={loading}>
                  <Instagram className="h-4 w-4 mr-2 text-pink-600 group-hover:scale-110 transition-transform" /> INSTAGRAM
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-0 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
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
              
              <Button className="w-full h-12 rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={handleEmailAuth} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  isRegistering ? t('login.registerBtn') : t('login.loginBtn')
                )}
              </Button>
              
              <Button variant="link" className="w-full text-primary font-bold text-[10px] uppercase tracking-wider" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? t('login.switchLogin') : t('login.switchRegister')}
              </Button>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      <p className="text-[10px] text-muted-foreground/60 text-center max-w-xs leading-relaxed uppercase tracking-widest px-4">
        {t('login.footer')}
      </p>
    </div>
  );
}
