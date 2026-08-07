"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@/lib/icons";
import { isArabic as checkIsArabic } from "@/lib/utils";

export interface SelectOption {
    value: string | number;
    label: string;
    subtitle?: string;
    original?: any; // Keep the original object if needed
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string | number | null;
    paddingVertical?: number;
    onChange: (value: string | number | null, option: SelectOption | null) => void;
    onSearch?: (term: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
    required?: boolean;
    className?: string;
    noResultsText?: string;
    renderOption?: (option: SelectOption) => React.ReactNode;
    filterOption?: (option: SelectOption, searchTerm: string) => boolean;
    /** Automatically focus this input on mount */
    autoFocus?: boolean;
    /** Called after a barcode exact-match auto-select so the parent can advance focus */
    onAutoSelect?: () => void;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    onSearch,
    placeholder = "بحث...",
    disabled = false,
    id,
    name,
    required = false,
    className = "",
    noResultsText = "لا توجد نتائج",
    renderOption,
    paddingVertical,
    filterOption,
    autoFocus = false,
    onAutoSelect,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isArabic, setIsArabic] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when requested (after initial mount / data load)
    useEffect(() => {
        if (autoFocus) {
            // Small delay so the DOM settles and parent data is ready
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [autoFocus]);

    // Get selected option label
    const selectedOption = Array.isArray(options)
        ? options.find((opt) => opt.value === value)
        : null;

    // Detect text direction
    useEffect(() => {
        const displayValue = isOpen ? searchTerm : inputValue;
        setIsArabic(checkIsArabic(displayValue));
    }, [isOpen, searchTerm, inputValue]);

    // Update input value when selection changes
    useEffect(() => {
        if (selectedOption) {
            setInputValue(selectedOption.label);
            setSearchTerm("");
        } else if (!value && !onSearch) {
            // Only clear if not in search mode
            setInputValue("");
            setSearchTerm("");
        }
    }, [selectedOption, value, onSearch]);

    // Filter options based on search (only if onSearch is not provided)
    const filteredOptions = onSearch
        ? options
        : Array.isArray(options)
            ? options.filter((opt) => {
                if (filterOption) return filterOption(opt, searchTerm);
                return opt.label.toLowerCase().includes(searchTerm.toLowerCase());
            })
            : [];

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Barcode exact-match auto-select ──────────────────────────────────
    // When the search term exactly matches a product's barcode field,
    // auto-select that product and notify the parent to advance focus.
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 3) return;
        if (value) return; // already selected

        const exactMatch = Array.isArray(options)
            ? options.find((opt) =>
                opt.original?.barcode &&
                opt.original.barcode.toString().trim() === searchTerm.trim()
            )
            : null;

        if (exactMatch) {
            onChange(exactMatch.value, exactMatch);
            setInputValue(exactMatch.label);
            setSearchTerm("");
            setIsOpen(false);
            // Notify parent to advance focus to the next field
            if (onAutoSelect) {
                setTimeout(() => onAutoSelect(), 50);
            }
        }
    }, [searchTerm, options, value, onChange, onAutoSelect]);
    // ─────────────────────────────────────────────────────────────────────

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setSearchTerm(val);
        if (onSearch) {
            onSearch(val);
        }
        if (!isOpen) setIsOpen(true);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        if (!selectedOption) {
            setSearchTerm(inputValue);
            // Only trigger search on focus if there's actually something to search for
            // to avoid redundant parent re-renders that look like page refreshes
            if (onSearch && inputValue.trim() !== "") {
                onSearch(inputValue);
            }
        }
    };

    const handleOptionClick = useCallback(
        (option: SelectOption) => {
            onChange(option.value, option);
            setInputValue(option.label);
            setSearchTerm("");
            setIsOpen(false);
        },
        [onChange]
    );

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null, null);
        setInputValue("");
        setSearchTerm("");
        if (onSearch) onSearch("");
        inputRef.current?.focus();
    };

    return (
        <div className={`searchable-select ${className}`} ref={containerRef}>
            <input
                ref={inputRef}
                type="text"
                id={id}
                name={name}
                value={isOpen ? searchTerm : inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                required={required && !value}
                style={{

                    paddingTop: paddingVertical ? (paddingVertical + "rem") : undefined,
                    paddingBottom: paddingVertical ? (paddingVertical + "rem") : undefined,
                    direction: isArabic ? "rtl" : "ltr",
                    textAlign: isArabic ? "right" : "left",
                    paddingLeft: "3rem",
                    paddingRight: (value && !isOpen) ? "2.5rem" : "1rem"
                }}
            />
            <div className="input-icon">
                <Icon name="search" size={18} />
            </div>
            {value && !isOpen && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="clear-btn"
                    title="مسح"
                >
                    <Icon name="x" size={16} />
                </button>
            )}
            <div className={`options-list ${isOpen ? "active" : ""}`}>
                {filteredOptions.length === 0 ? (
                    <div className="no-results">{noResultsText}</div>
                ) : (
                    filteredOptions.map((option) => (
                        <div
                            key={option.value}
                            className={`option-item ${value === option.value ? "selected" : ""}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {renderOption ? (
                                renderOption(option)
                            ) : (
                                <>
                                    <span className="option-name">{option.label}</span>
                                    {option.subtitle && (
                                        <span className="option-stock">{option.subtitle}</span>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
            <input type="hidden" name={name} value={value || ""} required={required} />
        </div>
    );
}


