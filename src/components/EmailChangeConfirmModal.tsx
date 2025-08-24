import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentEmail: string;
  newEmail: string;
}

export const EmailChangeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentEmail,
  newEmail,
}: EmailChangeConfirmModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar cambio de email</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>¿Estás seguro de que deseas cambiar tu email?</p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Email actual:</span> {currentEmail}
              </p>
              <p className="text-sm">
                <span className="font-medium">Nuevo email:</span> {newEmail}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Este cambio afectará tu email de autenticación y no se puede deshacer fácilmente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirmar cambio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};