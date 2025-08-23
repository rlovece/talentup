import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';

export default function ConfirmRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-confirmed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUser = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!token_hash || type !== 'signup') {
        setStatus('error');
        setMessage('Enlace de confirmación inválido.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        });

        if (error) {
          if (error.message.includes('already been confirmed')) {
            setStatus('already-confirmed');
            setMessage('Tu cuenta ya ha sido confirmada anteriormente.');
          } else {
            setStatus('error');
            setMessage(error.message);
          }
        } else {
          setStatus('success');
          setMessage('¡Tu cuenta ha sido confirmada exitosamente!');
        }
      } catch (error) {
        console.error('Error confirming user:', error);
        setStatus('error');
        setMessage('Ocurrió un error al confirmar tu cuenta.');
      }
    };

    confirmUser();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-emerald-500" />;
      case 'already-confirmed':
        return <AlertCircle className="h-16 w-16 text-amber-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-destructive" />;
      default:
        return <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-r-transparent" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return '¡Cuenta Confirmada!';
      case 'already-confirmed':
        return 'Cuenta Ya Confirmada';
      case 'error':
        return 'Error de Confirmación';
      default:
        return 'Confirmando tu cuenta...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesión y comenzar a usar TalentUp.';
      case 'already-confirmed':
        return 'Tu cuenta ya había sido confirmada anteriormente. Puedes proceder a iniciar sesión.';
      case 'loading':
        return 'Estamos verificando tu cuenta, por favor espera...';
      default:
        return message || 'Hubo un problema al confirmar tu cuenta. Verifica que el enlace sea válido o contacta con soporte.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
              TalentUp
            </h1>
          </div>
        </div>

        {/* Confirmation Card */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">
              {getStatusTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              {getStatusMessage()}
            </p>

            {status !== 'loading' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                  variant="default"
                >
                  Iniciar Sesión
                </Button>
                
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="w-full"
                >
                  Volver al Inicio
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Necesitas ayuda?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate('/register')}
                  >
                    Registrarse nuevamente
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            ¿Tienes problemas? Contacta nuestro soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
}