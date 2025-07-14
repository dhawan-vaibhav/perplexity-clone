'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';
import { SearchResult } from '../../src/entities/models/thread-item';

interface CitationTooltipProps {
  citationNumber: number;
  source: SearchResult;
  children: React.ReactNode;
}

export default function CitationTooltip({ citationNumber, source, children }: CitationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearHideTimeout();
    setIsVisible(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    clearHideTimeout();
    // Add a small delay before hiding to allow cursor to reach tooltip
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringTooltip) {
        setIsVisible(false);
      }
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    clearHideTimeout();
    setIsHoveringTooltip(true);
  };

  const handleTooltipMouseLeave = (e: React.MouseEvent) => {
    setIsHoveringTooltip(false);
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, []);

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(source.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <span 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <>
          {/* Invisible bridge to maintain hover state */}
          <div 
            className="fixed pointer-events-auto"
            style={{
              top: containerRef.current ? containerRef.current.getBoundingClientRect().top - 8 : 0,
              left: containerRef.current ? containerRef.current.getBoundingClientRect().left : 0,
              width: containerRef.current ? containerRef.current.offsetWidth : 0,
              height: 8,
              transform: 'translateY(-100%)'
            }}
            onMouseEnter={() => setIsHoveringTooltip(true)}
            onMouseLeave={() => setIsHoveringTooltip(false)}
          />
          
          <div 
            ref={tooltipRef}
            className="fixed z-50 pointer-events-auto"
            style={{
              top: containerRef.current ? containerRef.current.getBoundingClientRect().top - 8 : 0,
              left: containerRef.current ? containerRef.current.getBoundingClientRect().left + containerRef.current.offsetWidth / 2 : 0,
              transform: 'translate(-50%, -100%)'
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-sm w-80">
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"></div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
            
            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                {source.favicon && (
                  <img 
                    src={source.favicon} 
                    alt="" 
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white leading-tight overflow-hidden">
                    <div className="line-clamp-2">
                      {source.title}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleExternalLinkClick}
                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                  title="Open source in new tab"
                >
                  <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              </div>
              
              {source.snippet && (
                <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  <div className="line-clamp-3">
                    {source.snippet}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleExternalLinkClick}
                  className="truncate hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-left"
                  title="Open source in new tab"
                >
                  {new URL(source.url).hostname}
                </button>
                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0">
                  [{citationNumber}]
                </span>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </span>
  );
}