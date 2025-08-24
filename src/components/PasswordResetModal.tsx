import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Mail, KeyRound, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'code' | 'password';

export const PasswordResetModal = ({ isOpen, onClose }: PasswordResetModalProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-password-reset-code', {
        body: { email }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Código enviado",
          description: "Revisa tu email para el código de verificación.",
        });
        setStep('code');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar el código de verificación.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el código de verificación.",
        variant: "destructive"
      });
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('verify-reset-code', {
        body: { 
          email, 
          code, 
          newPassword 
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Error al actualizar la contraseña.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Tu contraseña ha sido actualizada correctamente.",
        });
        handleClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la contraseña.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'email':
        return (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-center">Recuperar Contraseña</DialogTitle>
              <DialogDescription className="text-center">
                Ingresa tu email para recibir un código de recuperación
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendResetEmail} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" variant="hero" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Código
                </Button>
              </div>
            </form>
          </>
        );
      
      case 'code':
        return (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-center">Código de Verificación</DialogTitle>
              <DialogDescription className="text-center">
                Ingresa el código que enviamos a {email}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVerifyCode} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="verification-code">Código de Verificación</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep('email')} className="flex-1">
                  Volver
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  Verificar Código
                </Button>
              </div>
            </form>
          </>
        );
      
      case 'password':
        return (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-center">Nueva Contraseña</DialogTitle>
              <DialogDescription className="text-center">
                Ingresa tu nueva contraseña
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep('code')} className="flex-1">
                  Volver
                </Button>
                <Button type="submit" variant="hero" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};