import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CompanyLogoProps {
  name: string;
  logoDomain?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyLogo({ name, logoDomain, size = 'sm', className }: CompanyLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  const initials = name
    .split(/[\s&]+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const logoUrl = logoDomain
    ? `https://logo.clearbit.com/${logoDomain}`
    : null;

  return (
    <Avatar className={cn(sizeClasses[size], 'rounded-md shrink-0', className)}>
      {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
      <AvatarFallback className="rounded-md bg-muted text-muted-foreground font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
