import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'sent';

export const PasswordResetModal = ({ isOpen, onClose }: PasswordResetModalProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setStep('email');
    setEmail('');
    onClose();
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setStep('sent');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar el email de recuperación.",
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
                Ingresa tu email para recibir un link de recuperación
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
                  Enviar Link
                </Button>
              </div>
            </form>
          </>
        );
      
      case 'sent':
        return (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-center">Email Enviado</DialogTitle>
              <DialogDescription className="text-center">
                Hemos enviado un link de recuperación a {email}. Revisa tu bandeja de entrada y sigue las instrucciones del email.
              </DialogDescription>
            </DialogHeader>
            <div className="flex space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={() => setStep('email')} className="flex-1">
                Enviar Otro Email
              </Button>
              <Button type="button" variant="hero" onClick={handleClose} className="flex-1">
                Cerrar
              </Button>
            </div>
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