
"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Chrome, Facebook, Twitter, Phone, Instagram, ArrowRight, Loader2, Sparkles } from "lucide-react";
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

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'twitter') => {
    setLoading(true);
    let provider;
    if (providerName === 'google') provider = new GoogleAuthProvider();
    else if (providerName === 'facebook') provider = new FacebookAuthProvider();
    else provider = new TwitterAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error: any) {
      toast({ title: "Error de conexión", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "¡Bienvenido!", description: "Cuenta creada con éxito." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-8 animate-in fade-in duration-1000">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary neo-glow animate-float mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">PantryPal <span className="text-secondary">AI</span></h1>
        <p className="text-muted-foreground">El futuro de tu cocina comienza aquí.</p>
      </div>

      <Card className="w-full glass overflow-hidden border-none">
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-secondary/10">
            <TabsTrigger value="social" className="data-[state=active]:bg-white/50">Social</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-white/50">Email</TabsTrigger>
          </TabsList>
          
          <CardContent className="p-8">
            <TabsContent value="social" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/5 group" onClick={() => handleSocialLogin('google')} disabled={loading}>
                  <Chrome className="h-5 w-5 mr-2 text-red-500 group-hover:scale-110 transition-transform" /> Google
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/5 group" onClick={() => handleSocialLogin('facebook')} disabled={loading}>
                  <Facebook className="h-5 w-5 mr-2 text-blue-600 group-hover:scale-110 transition-transform" /> Facebook
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/5 group" onClick={() => handleSocialLogin('twitter')} disabled={loading}>
                  <Twitter className="h-5 w-5 mr-2 text-sky-500 group-hover:scale-110 transition-transform" /> X
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-primary/5 group" disabled={loading}>
                  <Instagram className="h-5 w-5 mr-2 text-pink-600 group-hover:scale-110 transition-transform" /> Insta
                </Button>
              </div>
              <Button variant="secondary" className="w-full h-14 rounded-2xl font-bold" disabled={loading}>
                <Phone className="h-5 w-5 mr-2" /> Número de Teléfono
              </Button>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-0">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="Tu correo electrónico" 
                    className="h-14 pl-12 rounded-2xl border-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Tu contraseña" 
                    className="h-14 pl-12 rounded-2xl border-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg" onClick={handleEmailAuth} disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
              </Button>
              <Button variant="link" className="w-full text-primary" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
              </Button>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      <p className="text-xs text-muted-foreground/50">
        Al continuar, aceptas nuestros términos de servicio futuristas.
      </p>
    </div>
  );
}
