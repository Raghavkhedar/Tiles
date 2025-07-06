import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    
    let button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button', { name: /outline/i })
    expect(button).toHaveClass('border', 'border-input', 'bg-background')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    
    let button = screen.getByRole('button', { name: /small/i })
    expect(button).toHaveClass('h-9', 'px-3', 'rounded-md')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button', { name: /large/i })
    expect(button).toHaveClass('h-11', 'px-8', 'rounded-md')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with loading state', () => {
    render(<Button disabled>Loading...</Button>)
    
    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('pointer-events-none', 'opacity-50')
  })

  it('renders with icon', () => {
    render(
      <Button>
        <span data-testid="icon">🚀</span>
        With Icon
      </Button>
    )
    
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /with icon/i })).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
  })

  it('renders as different HTML elements', () => {
    const { rerender } = render(<Button asChild><a href="/test">Link</a></Button>)
    
    let link = screen.getByRole('link', { name: /link/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')

    rerender(<Button asChild><span>Span</span></Button>)
    const span = screen.getByText('Span')
    expect(span).toBeInTheDocument()
  })
}) 