
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
      </DialogContent>
    </Dialog>
  );
}