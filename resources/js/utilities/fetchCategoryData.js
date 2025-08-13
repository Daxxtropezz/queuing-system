// resources/js/fetchCategoryData.js
import axios from "axios";

export async function fetchCategoryData(categoryName) {
    try {
        const response = await axios.get(
            `/categories/${encodeURIComponent(categoryName)}`
        );
        return response.data.map((item) => item.category_value);
    } catch (error) {
        console.error(
            `Error fetching data for category ${categoryName}:`,
            error
        );
        return []; // Return an empty array in case of error
    }
}
