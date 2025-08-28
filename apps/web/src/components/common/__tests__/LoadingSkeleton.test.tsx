import React from 'react';
import { render } from '@testing-library/react';
import { LoadingSkeleton, DashboardSkeleton, ProfileSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders basic skeleton with default props', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('rounded');
  });

  it('renders text variant correctly', () => {
    const { container } = render(<LoadingSkeleton variant="text" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('rounded');
  });

  it('renders circular variant correctly', () => {
    const { container } = render(<LoadingSkeleton variant="circular" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders card variant correctly', () => {
    const { container } = render(<LoadingSkeleton variant="card" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('h-48');
    expect(skeleton).toHaveClass('rounded-lg');
  });

  it('renders multiple text lines', () => {
    const { container } = render(<LoadingSkeleton variant="text" lines={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    
    expect(skeletons).toHaveLength(3);
  });

  it('applies custom width and height', () => {
    const { container } = render(
      <LoadingSkeleton width="200px" height="100px" />
    );
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.style.width).toBe('200px');
    expect(skeleton.style.height).toBe('100px');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('custom-class');
  });

  it('renders last line with 3/4 width for multi-line text', () => {
    const { container } = render(<LoadingSkeleton variant="text" lines={2} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    
    expect(skeletons[0]).toHaveClass('w-full');
    expect(skeletons[1]).toHaveClass('w-3/4');
  });
});

describe('DashboardSkeleton', () => {
  it('renders complete dashboard skeleton structure', () => {
    const { container } = render(<DashboardSkeleton />);
    
    // Check for main container
    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
    
    // Check for grid layout
    expect(container.querySelector('.grid')).toBeInTheDocument();
    
    // Check for multiple skeleton elements
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(10);
  });

  it('includes welcome section skeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    
    // Should have welcome section with text skeletons
    const welcomeSection = container.querySelector('.lg\\:col-span-2');
    expect(welcomeSection).toBeInTheDocument();
  });

  it('includes stats grid skeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    
    // Should have stats grid with 2 columns
    const statsGrid = container.querySelector('.grid-cols-2');
    expect(statsGrid).toBeInTheDocument();
  });

  it('includes collection preview skeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    
    // Should have circular skeletons for collection items
    const circularSkeletons = container.querySelectorAll('.rounded-full');
    expect(circularSkeletons.length).toBeGreaterThan(0);
  });
});

describe('ProfileSkeleton', () => {
  it('renders complete profile skeleton structure', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Check for main container
    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
    
    // Check for grid layout
    expect(container.querySelector('.grid')).toBeInTheDocument();
    
    // Check for multiple skeleton elements
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(10);
  });

  it('includes profile information skeleton', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Should have profile section
    const profileSection = container.querySelector('.lg\\:col-span-2');
    expect(profileSection).toBeInTheDocument();
  });

  it('includes account statistics skeleton', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Should have stats section with border-t
    const statsSection = container.querySelector('.border-t');
    expect(statsSection).toBeInTheDocument();
  });

  it('includes sidebar skeleton', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Should have space-y-6 for sidebar items
    const sidebar = container.querySelector('.space-y-6');
    expect(sidebar).toBeInTheDocument();
  });
});