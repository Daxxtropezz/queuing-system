// utils/nameUtils.js
export const loadName = (client, column, fname, mname, lname) => {
    if (!client?.[column]) {
        return "";
    }

    const firstName = client[column][fname]?.trim() || "";
    const middleName = client[column][mname]?.trim() || "";
    const lastName = client[column][lname]?.replace(/\s+/g, "").trim() || ""; // Remove spaces in last name

    // Get first letter of each word in the first name
    const firstInitials = firstName
        .split(/\s+/) // Split by multiple spaces
        .map((word) => word[0]) // Get first letter of each word
        .join("")
        .toLowerCase();

    // Get first letter of middle name (if it exists)
    const middleInitial = middleName ? middleName[0].toLowerCase() : "";

    return `${firstInitials}${middleInitial}${lastName.toLowerCase()}`;
};