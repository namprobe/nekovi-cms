// src/shared/ui/selects/async-select.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui/select";
import "./styles.css";

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

    const selectedOption = options.find((opt) => opt.id === value);

    const loadOptions = useCallback(
        debounce(async (searchValue: string) => {
            setLoading(true);
            try {
                const res = await fetchOptions(searchValue);

                const filtered = res.filter((opt) =>
                    searchValue ? opt.label.toLowerCase().includes(searchValue.toLowerCase()) : true
                );

                // Nếu option đã chọn không có trong danh sách fetch, thêm vào
                if (value && value !== "all" && selectedOption) {
                    const exists = filtered.some((opt) => opt.id === selectedOption.id);
                    if (!exists) filtered.unshift(selectedOption);
                }

                setOptions(filtered);
            } catch (error) {
                console.error("Fetch error:", error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        [fetchOptions, selectedOption, value]
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (open && options.length === 0) {
                loadOptions("");
            }
            if (!open) setSearch("");
        },
        [options.length, loadOptions]
    );

    // Reload nếu value thay đổi nhưng options chưa có item tương ứng
    useEffect(() => {
        if (value && value !== "all" && !options.find((opt) => opt.id === value)) {
            loadOptions(search);
        }
    }, [value, options, loadOptions, search]);

    // Focus input khi mở dropdown
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setSearch(val);
            loadOptions(val);
        },
        [loadOptions]
    );

    const handleValueChange = useCallback(
        (val: string) => {
            onChange(val);
            setSearch("");
        },
        [onChange]
    );

    return (
        <Select value={value} onValueChange={handleValueChange} onOpenChange={handleOpenChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent
                className="async-select-content"
                onKeyDown={(e) => {
                    const prevent = ["ArrowDown", "ArrowUp", "Enter", " "];
                    if (prevent.includes(e.key)) e.stopPropagation();
                }}
            >
                <div className="async-select-search">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search..."
                        className="w-full border px-2 py-1 rounded text-sm"
                        autoComplete="off"
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>

                <div className="async-select-scroll">

                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            {option.label}
                        </SelectItem>
                    ))}

                    {loading && <div className="p-2 text-center text-sm">Loading...</div>}
                    {!loading && options.length === 0 && (
                        <div className="p-2 text-center text-sm text-gray-500">No results found</div>
                    )}
                </div>
            </SelectContent>
        </Select>
    );
}
