// src/shared/ui/selects/async-select.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui/select";
import "./styles.css"; // Import CSS

export interface Option {
    id: string;
    label: string;
}

interface AsyncSelectProps {
    value: string;
    onChange: (value: string) => void;
    fetchOptions: (search: string) => Promise<Option[]>;
    placeholder?: string;
    disabled?: boolean;
}

export function AsyncSelect({ value, onChange, fetchOptions, placeholder, disabled }: AsyncSelectProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadOptions = useCallback(
        debounce(async (searchValue: string) => {
            setLoading(true);
            try {
                const res = await fetchOptions(searchValue);
                setOptions(res);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }, 500),
        [fetchOptions]
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (open && options.length === 0) {
                loadOptions("");
            }
        },
        [options, loadOptions]
    );

    // Thêm: Preload nếu có value nhưng options chưa có item tương ứng (khi edit)
    useEffect(() => {
        if (value && !options.find((opt) => opt.id === value)) {
            loadOptions(""); // Load với search rỗng để lấy full list hoặc matched
        }
    }, [value, options, loadOptions]);

    useEffect(() => {
        if (isOpen && search.length >= 1) {
            loadOptions(search);
        }
    }, [search, isOpen, loadOptions]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [options, loading, isOpen]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearch(newValue);
        if (newValue === "") {
            loadOptions("");
        }
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <Select value={value} onValueChange={onChange} onOpenChange={handleOpenChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className="async-select-content">
                {/* Thanh search luôn hiển thị trên cùng */}
                <div className="async-select-search">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search..."
                        className="w-full border rounded px-2 py-1 text-sm"
                        autoComplete="off"
                    />
                </div>

                {/* Vùng scroll chứa options */}
                <div className="async-select-scroll">
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            {option.label}
                        </SelectItem>
                    ))}
                    {loading && <div className="p-2 text-center text-sm">Loading...</div>}
                    {!loading && options.length === 0 && (
                        <div className="p-2 text-center text-sm text-gray-500">No results</div>
                    )}
                </div>
            </SelectContent>
        </Select>
    );
}