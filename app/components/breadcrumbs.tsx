'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide" aria-label="Breadcrumb">
      <Link 
        href="/dashboard"
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home size={16} />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          {item.active || !item.href ? (
            <span className={`font-semibold ${item.active ? 'text-gray-900' : 'text-gray-500'}`}>
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
