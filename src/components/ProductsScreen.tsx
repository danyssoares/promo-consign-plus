import { useState, useEffect } from "react";
import { ArrowLeft, Building2, CreditCard, Home, GraduationCap, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  consignataria: string;
  convenio: string;
  nome: string;
  limiteDisponivel: number;
  tipo: 'emprestimo' | 'cartao' | 'mensalidade' | 'habitacional' | 'estudantil';
}

interface ProductsScreenProps {
  onBack: () => void;
}

const productTypes = {
  emprestimo: { label: "Empréstimo", icon: Banknote, color: "bg-blue-100 text-blue-800" },
  cartao: { label: "Cartão de Crédito", icon: CreditCard, color: "bg-green-100 text-green-800" },
  mensalidade: { label: "Mensalidade", icon: Building2, color: "bg-purple-100 text-purple-800" },
  habitacional: { label: "Habitacional", icon: Home, color: "bg-orange-100 text-orange-800" },
  estudantil: { label: "Estudantil", icon: GraduationCap, color: "bg-yellow-100 text-yellow-800" }
};

export const ProductsScreen = ({ onBack }: ProductsScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockProducts: Product[] = [
      {
        id: "1",
        consignataria: "Banco ABC",
        convenio: "Prefeitura Municipal",
        nome: "Empréstimo Pessoal",
        limiteDisponivel: 15000.00,
        tipo: "emprestimo"
      },
      {
        id: "2",
        consignataria: "Financeira XYZ",
        convenio: "Estado São Paulo",
        nome: "Cartão Consignado",
        limiteDisponivel: 8000.00,
        tipo: "cartao"
      },
      {
        id: "3",
        consignataria: "Banco DEF",
        convenio: "Prefeitura Municipal",
        nome: "Crédito Habitacional",
        limiteDisponivel: 250000.00,
        tipo: "habitacional"
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const groupedProducts = Object.keys(productTypes).reduce((groups, type) => {
    groups[type as keyof typeof productTypes] = products.filter(p => p.tipo === type);
    return groups;
  }, {} as Record<keyof typeof productTypes, Product[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Produtos Disponíveis</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {loading ? (
          // Loading skeleton
          <div className="space-y-6">
            {Object.keys(productTypes).map((type) => (
              <div key={type} className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Card>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          // Products by category
          Object.entries(productTypes).map(([type, config]) => {
            const categoryProducts = groupedProducts[type as keyof typeof productTypes];
            const IconComponent = config.icon;
            
            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconComponent size={20} className="text-muted-foreground" />
                  <h2 className="text-lg font-medium">{config.label}</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {categoryProducts.length}
                  </Badge>
                </div>
                
                {categoryProducts.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-muted-foreground">
                        <IconComponent size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Nenhum produto disponível nesta categoria</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {categoryProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{product.nome}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 size={14} />
                                <span>{product.consignataria}</span>
                              </div>
                            </div>
                            <Badge className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Convênio:</span>
                              <span className="text-sm font-medium">{product.convenio}</span>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Limite Disponível:</span>
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(product.limiteDisponivel)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};