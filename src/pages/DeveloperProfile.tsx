import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { REQUIRE_EMAIL_CONFIRM_ON_CHANGE } from '@/config/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Github, Linkedin, User, Mail, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmailChangeConfirmModal } from '@/components/EmailChangeConfirmModal';
import { AppHeader } from '@/components/AppHeader';

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  github_link: z.string().url('URL inválida').optional().or(z.literal('')),
  linkedin_link: z.string().url('URL inválida').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Selecciona al menos una habilidad')
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Skill {
  id: string;
  name: string;
}

interface DeveloperProfile {
  id: string;
  name: string | null;
  email: string | null;
  github_link: string | null;
  linkedin_link: string | null;
  skills: string[] | null;
  avatar_url: string | null;
  cv_url: string | null;
}

export default function DeveloperProfile() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState<any>(null);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      github_link: '',
      linkedin_link: '',
      skills: []
    }
  });

  // Load profile data and available skills
  useEffect(() => {
    if (user) {
      loadProfile();
      loadSkills();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setValue('name', data.name || '');
        setValue('email', data.email || '');
        setValue('github_link', data.github_link || '');
        setValue('linkedin_link', data.linkedin_link || '');
        const skills = data.skills || [];
        setValue('skills', skills);
        setSelectedSkills(skills);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil',
        variant: 'destructive'
      });
    }
  };

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (error: any) {
      console.error('Error loading skills:', error);
    }
  };

  const addSkill = async (skillName: string) => {
    if (!skillName.trim()) return;

    // Check if skill already exists
    const existingSkill = availableSkills.find(s => 
      s.name.toLowerCase() === skillName.toLowerCase()
    );

    if (existingSkill) {
      // Add to selected if not already selected
      if (!selectedSkills.includes(existingSkill.name)) {
        const newSkills = [...selectedSkills, existingSkill.name];
        setSelectedSkills(newSkills);
        setValue('skills', newSkills);
      }
    } else {
      // Create new skill
      try {
        const { data, error } = await supabase
          .from('skills')
          .insert({ name: skillName.trim() })
          .select()
          .single();

        if (error) throw error;

        setAvailableSkills(prev => [...prev, data]);
        const newSkills = [...selectedSkills, data.name];
        setSelectedSkills(newSkills);
        setValue('skills', newSkills);

        toast({
          title: 'Habilidad añadida',
          description: `"${data.name}" se ha añadido a la base de datos`
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudo añadir la habilidad',
          variant: 'destructive'
        });
      }
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string> => {
    if (!user) throw new Error('No user found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAvatarChange = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const avatarUrl = await uploadFile(file, 'avatars', 'developer-avatars');
      
      // Update the profile in the database immediately
      const { error } = await supabase
        .from('developers')
        .update({
          user_id: user.id,
          avatar_url: avatarUrl,
          // Keep existing data
          name: profile?.name,
          email: profile?.email,
          github_link: profile?.github_link,
          linkedin_link: profile?.linkedin_link,
          skills: profile?.skills,
          cv_url: profile?.cv_url
        })
        .eq("user_id", user.id);;

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      setAvatarFile(null);

      toast({
        title: 'Avatar actualizado',
        description: 'Tu foto de perfil se ha guardado correctamente'
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo subir el avatar',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);

    try {
      let cvUrl = profile?.cv_url;

      // Upload CV if selected
      if (cvFile) {
        setUploading(true);
        cvUrl = await uploadFile(cvFile, 'cvs', 'developer-cvs');
        setUploading(false);
      }

      // Check if email has changed
      const emailChanged = data.email !== profile?.email && data.email !== user.email;

      if (emailChanged) {
        // Show confirmation modal before changing email
        setPendingEmailData(data);
        setShowEmailConfirm(true);
        setLoading(false);
        return;
      }

      // Update or create developer profile
      const profileData = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        github_link: data.github_link || null,
        linkedin_link: data.linkedin_link || null,
        skills: data.skills,
        avatar_url: profile?.avatar_url, // Avatar is updated separately
        cv_url: cvUrl
      };

      const { error } = await supabase
        .from('developers')
        .update(profileData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil se ha guardado correctamente'
      });

      // Reload profile
      loadProfile();
      setCvFile(null);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el perfil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChangeConfirm = async () => {
    if (!pendingEmailData) return;
    
    setLoading(true);
    setShowEmailConfirm(false);
    
    try {
      if (REQUIRE_EMAIL_CONFIRM_ON_CHANGE) {
        const { error: authError } = await supabase.auth.updateUser({
          email: pendingEmailData.email
        });
        if (authError) {
          throw new Error(`Error al actualizar email de autenticación: ${authError.message}`);
        }
      } else {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('update-user-email', {
          body: { newEmail: pendingEmailData.email },
        });
        if (fnError) {
          throw new Error(fnError.message || 'No se pudo actualizar el email sin confirmación');
        }
      }

      toast({
        title: 'Email actualizado',
        description: REQUIRE_EMAIL_CONFIRM_ON_CHANGE
          ? 'Se ha enviado un email de confirmación a tu nueva dirección. Confirma el cambio para completar la actualización.'
          : 'Tu email de autenticación se actualizó inmediatamente.',
        duration: 5000
      });

      // Continue with the rest of the profile update
      await completeProfileUpdate(pendingEmailData);
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setPendingEmailData(null);
    }
  };

  const completeProfileUpdate = async (data: any) => {
    try {
      let cvUrl = profile?.cv_url;

      // Upload CV if selected
      if (cvFile) {
        setUploading(true);
        cvUrl = await uploadFile(cvFile, 'cvs', 'developer-cvs');
        setUploading(false);
      }

      // Update or create developer profile
      const profileData = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        github_link: data.github_link || null,
        linkedin_link: data.linkedin_link || null,
        skills: data.skills,
        avatar_url: profile?.avatar_url, // Avatar is updated separately
        cv_url: cvUrl
      };

      const { error } = await supabase
        .from('developers')
        .update(profileData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil se ha guardado correctamente'
      });

      // Reload profile
      loadProfile();
      setCvFile(null);
    } catch (error: any) {
      throw error;
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillInput.toLowerCase()) &&
    !selectedSkills.includes(skill.name)
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6 text-primary" />
                Perfil de Desarrollador
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/welcome/developer')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile?.avatar_url || ''} 
                    alt="Avatar" 
                  />
                  <AvatarFallback className="text-lg">
                    {watch('name')?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Subiendo...' : (profile?.avatar_url ? 'Cambiar Avatar' : 'Añadir Avatar')}
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarChange(file);
                      }
                    }}
                  />
                  {profile?.avatar_url && (
                    <p className="text-xs text-muted-foreground text-center">
                      Haz clic para cambiar tu foto de perfil
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre completo
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Tu nombre completo"
                        className="mt-1"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="mt-1"
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub (opcional)
                  </Label>
                  <Controller
                    name="github_link"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="github"
                        placeholder="https://github.com/tu-usuario"
                        className="mt-1"
                      />
                    )}
                  />
                  {errors.github_link && (
                    <p className="text-sm text-destructive mt-1">{errors.github_link.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn (opcional)
                  </Label>
                  <Controller
                    name="linkedin_link"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="linkedin"
                        placeholder="https://linkedin.com/in/tu-perfil"
                        className="mt-1"
                      />
                    )}
                  />
                  {errors.linkedin_link && (
                    <p className="text-sm text-destructive mt-1">{errors.linkedin_link.message}</p>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <Label className="text-base font-medium">Habilidades</Label>
                
                {/* Selected Skills */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {selectedSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Skill Input */}
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Escribe una habilidad..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    variant="outline"
                  >
                    Añadir
                  </Button>
                </div>

                {/* Skill Suggestions */}
                {skillInput && filteredSkills.length > 0 && (
                  <div className="mt-2 border border-border rounded-md bg-card max-h-40 overflow-y-auto">
                    {filteredSkills.slice(0, 5).map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => addSkill(skill.name)}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                )}

                {errors.skills && (
                  <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>
                )}
              </div>

              {/* CV Upload */}
              <div>
                <Label htmlFor="cv" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CV (PDF)
                </Label>
                <div className="mt-2 flex items-center gap-4">
                  <Label htmlFor="cv" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      {cvFile ? 'Cambiar CV' : 'Subir CV'}
                    </div>
                  </Label>
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCvFile(file);
                    }}
                  />
                  {cvFile && (
                    <p className="text-sm text-muted-foreground">{cvFile.name}</p>
                  )}
                  {profile?.cv_url && !cvFile && (
                    <a 
                      href={profile.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Ver CV actual
                    </a>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={loading || uploading}
                className="w-full"
              >
                {loading ? 'Guardando...' : 'Guardar Perfil'}
              </Button>
            </form>

            <EmailChangeConfirmModal
              isOpen={showEmailConfirm}
              onClose={() => {
                setShowEmailConfirm(false);
                setPendingEmailData(null);
              }}
              onConfirm={handleEmailChangeConfirm}
              currentEmail={user?.email || ''}
              newEmail={pendingEmailData?.email || ''}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
