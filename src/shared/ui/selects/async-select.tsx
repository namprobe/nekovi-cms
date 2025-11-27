// src/shared/ui/selects/async-select.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { debounce } from "lodash";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui/select";
import { X } from "lucide-react";

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
    clearable?: boolean;
    // MỚI: Cho phép truyền option đã chọn từ ngoài vào (rất quan trọng khi edit)
    initialSelectedOption?: Option | null;
}

export function AsyncSelect({
    value,
    onChange,
    fetchOptions,
    placeholder = "Select an option",
    disabled,
    clearable = false,
    initialSelectedOption
}: AsyncSelectProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Đảm bảo option đã chọn luôn tồn tại trong danh sách (kể cả khi chưa fetch)
    const effectiveOptions = useMemo(() => {
        if (!value) return options;

        const hasSelected = options.some(opt => opt.id === value);
        if (hasSelected) return options;

        // Nếu chưa có trong danh sách → thêm vào đầu (từ initial hoặc fallback)
        const selected = initialSelectedOption || { id: value, label: "Loading..." };
        return [selected, ...options];
    }, [options, value, initialSelectedOption]);

    const selectedOption = effectiveOptions.find(opt => opt.id === value);

    const loadOptions = useCallback(
        debounce(async (searchValue: string) => {
            setLoading(true);
            try {
                const res = await fetchOptions(searchValue);
                setOptions(res);
            } catch (error) {
                console.error("Fetch error:", error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        [fetchOptions]
    );

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open) {
            loadOptions(search || "");
        }
        if (!open) setSearch("");
    }, [search, loadOptions]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        loadOptions(val);
    }, [loadOptions]);

    const handleValueChange = useCallback((val: string) => {
        onChange(val);
        setSearch("");
    }, [onChange]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(""); // Bắt buộc gọi onChange để cập nhật state cha
    };

    return (
        <div className="relative w-full">
            <Select value={value} onValueChange={handleValueChange} onOpenChange={handleOpenChange} disabled={disabled}>
                <SelectTrigger className="w-full pr-8">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    <div className="p-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {loading && (
                            <div className="p-3 text-center text-sm text-muted-foreground">Loading...</div>
                        )}
                        {effectiveOptions.length === 0 && !loading && (
                            <div className="p-3 text-center text-sm text-muted-foreground">No results found</div>
                        )}
                        {effectiveOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </div>
                </SelectContent>
            </Select>

            {/* Nút X nằm ngoài SelectTrigger → không bao giờ mở dropdown */}
            {clearable && value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>

    );
}