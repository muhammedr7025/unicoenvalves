/**
 * Format a number as currency with international formatting (1,234,567)
 * Used consistently across the entire application.
 */
export function formatCurrency(amount: number | undefined | null): string {
    const value = amount ?? 0;
    return `₹${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Format a number with international comma formatting (no currency symbol)
 */
export function formatNumber(amount: number | undefined | null): string {
    const value = amount ?? 0;
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
