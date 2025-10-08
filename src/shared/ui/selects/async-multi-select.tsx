// src/shared/ui/selects/async-multi-select.tsx
"use client";

import * as React from "react";
import AsyncSelect from "react-select/async";
import { MultiValue, ActionMeta } from "react-select";

interface AsyncMultiSelectProps {
    value: string[];
    onChange: (val: string[]) => void;
    fetchOptions: (search: string) => Promise<{ id: string; label: string }[]>;
    initialOptions?: { id: string; label: string }[]; // Thêm prop để preload tags
    placeholder?: string;
    className?: string;
    tagClassName?: string;
    disabled?: boolean;
}

type SelectOption = { value: string; label: string };

export function AsyncMultiSelect({
    value,
    onChange,
    fetchOptions,
    initialOptions = [], // Mặc định là mảng rỗng
    placeholder = "Select...",
    className = "",
    tagClassName = "",
    disabled = false,
}: AsyncMultiSelectProps) {
    const [loading, setLoading] = React.useState(false);
    const [cachedOptions, setCachedOptions] = React.useState<{ id: string; label: string }[]>(initialOptions);

    // Preload initialOptions vào cachedOptions khi component mount
    React.useEffect(() => {
        if (value.length > 0 && value.some((id) => !cachedOptions.find((o) => o.id === id))) {
            loadOptions("");
        }
    }, [value, cachedOptions]);


    const loadOptions = async (inputValue: string): Promise<SelectOption[]> => {
        setLoading(true);
        try {
            const opts = await fetchOptions(inputValue);
            setCachedOptions((prev) => {
                const newOptions = opts.filter((opt) => !prev.some((p) => p.id === opt.id));
                return [...prev, ...newOptions];
            });
            return opts.map((o) => ({ value: o.id, label: o.label }));
        } catch (error) {
            console.error("Failed to load options:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    /// Gộp hai useEffect để preload options

    React.useEffect(() => {

        if (value.length > 0 && value.some((id) => !cachedOptions.find((o) => o.id === id))) {
            loadOptions("");
        }

    }, [value]);


    const selectedOptions = value.map((id) => {
        const option = cachedOptions.find((o) => o.id === id);
        return {
            value: id,
            label: option?.label || id, // Fallback nếu chưa load
        };
    });

    return (
        <AsyncSelect
            isMulti
            isLoading={loading}
            isDisabled={disabled}
            placeholder={placeholder}
            value={selectedOptions}
            onChange={(newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
                onChange(newValue.map((s) => s.value));
            }}
            loadOptions={loadOptions}
            defaultOptions={true} // Trigger loadOptions("") khi mở lần đầu
            className={className}
            styles={{
                control: (base) => ({
                    ...base,
                    backgroundColor: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    borderColor: "hsl(var(--border))",
                    boxShadow: "none",
                    "&:hover": {
                        borderColor: "hsl(var(--ring))",
                    },
                }),
                menu: (base) => ({
                    ...base,
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                }),
                option: (base, { isFocused }) => ({
                    ...base,
                    backgroundColor: isFocused ? "hsl(var(--muted))" : "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                }),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: `hsl(var(--accent)) ${tagClassName}`,
                    border: "1px solid hsl(var(--border))",
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: "hsl(var(--accent-foreground))",
                }),
                multiValueRemove: (base) => ({
                    ...base,
                    color: "hsl(var(--accent-foreground))",
                    ":hover": {
                        backgroundColor: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                    },
                }),
                placeholder: (base) => ({
                    ...base,
                    color: "hsl(var(--muted-foreground))",
                }),
                input: (base) => ({
                    ...base,
                    color: "hsl(var(--foreground))",
                }),
            }}
            aria-label="Select multiple tags"
        />
    );
}