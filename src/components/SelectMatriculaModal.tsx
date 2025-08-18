import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface MatriculaData {
  codigoMatricula: string;
  // Adicione outras propriedades conforme necessário
  [key: string]: unknown;
}

interface SelectMatriculaModalProps {
  matriculas: MatriculaData[];
  onSelect: (matricula: MatriculaData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function SelectMatriculaModal({ matriculas, onSelect, onCancel, isOpen }: SelectMatriculaModalProps) {
  const [selectedMatricula, setSelectedMatricula] = useState<string>('');

  const handleSelect = () => {
    if (selectedMatricula) {
      const matricula = matriculas.find(m => m.codigoMatricula === selectedMatricula);
      if (matricula) {
        onSelect(matricula);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Matrícula</DialogTitle>
          <DialogDescription>
            Você possui mais de uma matrícula. Selecione a matrícula que deseja utilizar.
          </DialogDescription>
        </DialogHeader>
        
        <RadioGroup onValueChange={setSelectedMatricula} value={selectedMatricula}>
          {matriculas.map((matricula) => (
            <div key={matricula.codigoMatricula} className="flex items-center space-x-2">
              <RadioGroupItem value={matricula.codigoMatricula} id={matricula.codigoMatricula} />
              <Label htmlFor={matricula.codigoMatricula}>
                {matricula.codigoMatricula}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSelect} disabled={!selectedMatricula}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}