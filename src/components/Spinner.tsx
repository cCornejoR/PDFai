import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = "w-4 h-4" }) => {
  return <Loader2 className={`animate-spin ${className}`} />;
};
