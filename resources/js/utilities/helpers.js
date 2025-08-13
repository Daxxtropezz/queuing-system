export function formatCurrency(value) {
    if (value === null || value === undefined) return "₱ 0.00";

    // Convert to number if it's a string
    const num = typeof value === "string" ? parseFloat(value) : value;

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(num);
}