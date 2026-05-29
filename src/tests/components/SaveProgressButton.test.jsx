import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SaveProgressButton from '@/components/forms/SaveProgressButton';

describe('SaveProgressButton', () => {
  it('renders with default label', () => {
    const handleClick = vi.fn();
    render(<SaveProgressButton onClick={handleClick} />);
    
    expect(screen.getByText('Salvar Progresso')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    const handleClick = vi.fn();
    render(<SaveProgressButton onClick={handleClick} label="Salvar Rascunho" />);
    
    expect(screen.getByText('Salvar Rascunho')).toBeInTheDocument();
  });

  it('shows saving state with loading spinner', () => {
    const handleClick = vi.fn();
    render(
      <SaveProgressButton 
        onClick={handleClick} 
        saving={true}
        savingLabel="Salvando rascunho..."
      />
    );
    
    expect(screen.getByText('Salvando rascunho...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<SaveProgressButton onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when saving', () => {
    const handleClick = vi.fn();
    render(<SaveProgressButton onClick={handleClick} saving={true} />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<SaveProgressButton onClick={handleClick} disabled={true} />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    const handleClick = vi.fn();
    const customClass = 'bg-red-500';
    render(
      <SaveProgressButton 
        onClick={handleClick} 
        className={customClass}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('renders save icon when not saving', () => {
    const handleClick = vi.fn();
    const { container } = render(<SaveProgressButton onClick={handleClick} />);
    
    // Check if SVG (icon) is present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});