'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface Option {
    value: string;
    label: string;
    sublabel?: string;
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    loading?: boolean;
    maxDisplayed?: number; // Max items to display at once (virtualization)
}

export default function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    disabled = false,
    className = '',
    loading = false,
    maxDisplayed = 100, // Show max 100 at a time for performance
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Find selected option for display
    const selectedOption = useMemo(() => {
        return options.find(opt => opt.value === value);
    }, [options, value]);

    // Filter options based on search (memoized for performance)
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) {
            return options.slice(0, maxDisplayed);
        }

        const search = searchTerm.toLowerCase();
        const results = options.filter(opt =>
            opt.label.toLowerCase().includes(search) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(search))
        );

        return results.slice(0, maxDisplayed);
    }, [options, searchTerm, maxDisplayed]);

    // Track if there are more results
    const hasMoreResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return options.length > maxDisplayed;
        }
        const search = searchTerm.toLowerCase();
        const totalMatches = options.filter(opt =>
            opt.label.toLowerCase().includes(search) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(search))
        ).length;
        return totalMatches > maxDisplayed;
    }, [options, searchTerm, maxDisplayed]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset highlight when filtered options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchTerm]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setHighlightedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    );
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;

            case 'Enter':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    selectOption(filteredOptions[highlightedIndex]);
                } else if (!isOpen) {
                    setIsOpen(true);
                }
                break;

            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                break;

            case 'Tab':
                setIsOpen(false);
                setSearchTerm('');
                break;
        }
    }, [disabled, isOpen, filteredOptions, highlightedIndex]);

    // Select an option
    const selectOption = useCallback((option: Option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
    }, [onChange]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const highlightedEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
            if (highlightedEl) {
                highlightedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Main button/display */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer transition-all
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-green-400'}
          ${isOpen ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300'}
        `}
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type to search..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div ref={listRef} className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-green-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                No matches found
                            </div>
                        ) : (
                            <>
                                {filteredOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        data-index={index}
                                        onClick={() => selectOption(option)}
                                        className={`px-3 py-2 cursor-pointer transition-colors
                      ${value === option.value ? 'bg-green-50 text-green-800' : ''}
                      ${highlightedIndex === index ? 'bg-green-100' : 'hover:bg-gray-50'}
                    `}
                                    >
                                        <div className="text-sm font-medium">{option.label}</div>
                                        {option.sublabel && (
                                            <div className="text-xs text-gray-500">{option.sublabel}</div>
                                        )}
                                    </div>
                                ))}

                                {/* More results indicator */}
                                {hasMoreResults && (
                                    <div className="px-3 py-2 text-center text-xs text-gray-500 bg-gray-50 border-t">
                                        {searchTerm
                                            ? `Showing first ${maxDisplayed} matches. Type more to narrow results.`
                                            : `Showing first ${maxDisplayed} of ${options.length}. Type to search all.`
                                        }
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Stats footer */}
                    <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
                        <span>{filteredOptions.length} shown</span>
                        <span>{options.length} total</span>
                    </div>
                </div>
            )}
        </div>
    );
}
