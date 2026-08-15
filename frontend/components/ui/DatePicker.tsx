"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@/lib/icons";

export interface DatePickerProps {
    value: string; // Format: YYYY-MM-DD
    onChange: (date: string) => void;
    id?: string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    minDate?: string;
    maxDate?: string;
}

const ARABIC_MONTHS = [
    catalogMessage("common.general.january"), catalogMessage("common.general.february"), catalogMessage("common.general.march"), catalogMessage("common.general.april"), catalogMessage("common.general.may"), catalogMessage("common.general.june"),
    catalogMessage("common.general.july"), catalogMessage("common.general.august"), catalogMessage("common.general.september"), catalogMessage("common.general.october"), catalogMessage("common.general.november"), catalogMessage("common.general.december")
];

const ARABIC_DAYS = [catalogMessage("ui.datepicker.ah"), catalogMessage("ui.datepicker.mon"), catalogMessage("ui.datepicker.thu"), catalogMessage("ui.datepicker.ar"), catalogMessage("ui.datepicker.khm"), catalogMessage("ui.datepicker.egp"), catalogMessage("ui.datepicker.sat")];

export function DatePicker({
    value,
    onChange,
    id,
    name,
    label,
    placeholder = catalogMessage("ui.datepicker.selectDate"),
    required = false,
    disabled = false,
    className = "",
    minDate,
    maxDate,
}: DatePickerProps) {
    const { t: i18n } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const initialDate = value ? new Date(value) : today;
    const [viewYear, setViewYear] = useState(initialDate.getFullYear() || today.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth() || today.getMonth());

    useEffect(() => {
        if (value) {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                setViewYear(parsed.getFullYear());
                setViewMonth(parsed.getMonth());
            }
        }
    }, [value]);

    // Close popover on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const inContainer = containerRef.current && containerRef.current.contains(target);
            const inPopover = popoverRef.current && popoverRef.current.contains(target);
            if (!inContainer && !inPopover) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDateStr = (y: number, m: number, d: number) => {
        const mm = String(m + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
    };

    const selectDate = (day: number) => {
        const formatted = formatDateStr(viewYear, viewMonth, day);
        onChange(formatted);
        setIsOpen(false);
    };

    const handlePreset = (preset: "today" | "6m" | "1y" | "clear") => {
        if (preset === "clear") {
            onChange("");
            setIsOpen(false);
            return;
        }

        const d = new Date();
        if (preset === "6m") {
            d.setMonth(d.getMonth() + 6);
        } else if (preset === "1y") {
            d.setFullYear(d.getFullYear() + 1);
        }

        const y = d.getFullYear();
        const m = d.getMonth();
        const day = d.getDate();

        setViewYear(y);
        setViewMonth(m);
        onChange(formatDateStr(y, m, day));
        setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);

    const prevMonthDays = getDaysInMonth(
        viewMonth === 0 ? viewYear - 1 : viewYear,
        viewMonth === 0 ? 11 : viewMonth - 1
    );

    const calendarCells = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
        calendarCells.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            dateStr: "",
        });
    }

    const selectedDateStr = value;
    const todayDateStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = formatDateStr(viewYear, viewMonth, d);
        calendarCells.push({
            day: d,
            isCurrentMonth: true,
            isToday: dateStr === todayDateStr,
            isSelected: dateStr === selectedDateStr,
            dateStr: dateStr,
        });
    }

    return (
        <div className={`custom-date-picker ${className}`} ref={containerRef}>
            {label && <label htmlFor={id}>{label}</label>}
            <div className="date-picker-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    id={id}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={(e) => {
                        e.target.select();
                        setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete="off"
                    className="glass"
                />
                <button
                    type="button"
                    className="date-picker-icon-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    tabIndex={-1}
                >
                    <Icon name="calendar" size={18} />
                </button>

                {value && (
                    <button
                        type="button"
                        className="date-picker-clear-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        title={i18n.catalog["common.general.clear"]}
                    >
                        <Icon name="x" size={16} />
                    </button>
                )}

                {isOpen && (
                    <div ref={popoverRef} className="calendar-popover">
                        <div className="calendar-header">
                            <button
                                type="button"
                                className="calendar-nav-btn"
                                onClick={prevMonth}
                                title={i18n.catalog["ui.datepicker.previousMonth"]}
                            >
                                <Icon name="chevron-right" size={16} />
                            </button>
                            <span className="calendar-title">
                                {ARABIC_MONTHS[viewMonth]} {viewYear}
                            </span>
                            <button
                                type="button"
                                className="calendar-nav-btn"
                                onClick={nextMonth}
                                title={i18n.catalog["ui.datepicker.nextMonth"]}
                            >
                                <Icon name="chevronLeft" size={16} />
                            </button>
                        </div>

                        <div className="calendar-weekdays">
                            {ARABIC_DAYS.map((d) => (
                                <div key={d}>{d}</div>
                            ))}
                        </div>

                        <div className="calendar-days-grid">
                            {calendarCells.map((cell, idx) => {
                                if (!cell.isCurrentMonth) {
                                    return (
                                        <div key={idx} className="calendar-day-empty">
                                            {cell.day}
                                        </div>
                                    );
                                }

                                const isSelected = cell.isSelected;
                                const isToday = cell.isToday;

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => selectDate(cell.day)}
                                        className={`calendar-day-btn ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                                    >
                                        {cell.day}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="calendar-presets">
                            <button
                                type="button"
                                className="calendar-preset-btn"
                                onClick={() => handlePreset("today")}
                            >
                                {i18n.catalog["ui.datepicker.today"]}</button>
                            <button
                                type="button"
                                className="calendar-preset-btn"
                                onClick={() => handlePreset("6m")}
                            >
                                {i18n.catalog["ui.datepicker.message6Months"]}</button>
                            <button
                                type="button"
                                className="calendar-preset-btn"
                                onClick={() => handlePreset("1y")}
                            >
                                {i18n.catalog["ui.datepicker.year"]}</button>
                            <button
                                type="button"
                                className="calendar-preset-btn danger"
                                onClick={() => handlePreset("clear")}
                            >
                                {i18n.catalog["common.general.clear"]}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
