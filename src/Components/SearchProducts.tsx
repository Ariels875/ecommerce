import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../Ui/Input';
import { Button } from '../Ui/Button';
import { Search } from 'lucide-react';

interface SearchProductsProps {
  variant?: 'default' | 'modal';
  onClose?: () => void;
}

export const SearchProducts: React.FC<SearchProductsProps> = ({ 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_DEV}/products/search?query=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error('Error al buscar productos');
      }

      const results = await response.json();
      
      // Si hay resultados, navegar a una página de resultados
      if (results.length > 0) {
        navigate('/search', { 
          state: { 
            searchTerm, 
            results 
          } 
        });

        // Si es un modal, cerrar
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      // Opcional: mostrar un toast o mensaje de error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2 w-full">
      <Input 
        type="search" 
        placeholder="Buscar productos..." 
        className="w-full" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleSearch}
        className="transition-colors duration-300 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <Search className="h-5 w-5 dark:text-white" />
        <span className="sr-only">Buscar</span>
      </Button>
    </div>
  );
};