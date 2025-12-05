// Test untuk memeriksa fungsi deduplicateArray

const deduplicateArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr.filter(item => {
    const normalized = String(item).trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

// Test case 1: Array dengan item unik
const test1 = ["Item 1", "Item 2", "Item 3"];
console.log("Test 1 - Unique items:");
console.log("Input:", test1);
console.log("Output:", deduplicateArray(test1));
console.log("Expected length: 3, Actual length:", deduplicateArray(test1).length);
console.log("");

// Test case 2: Array dengan item duplikat (case-insensitive)
const test2 = ["Item 1", "item 1", "ITEM 1"];
console.log("Test 2 - Duplicate items (different cases):");
console.log("Input:", test2);
console.log("Output:", deduplicateArray(test2));
console.log("Expected length: 1, Actual length:", deduplicateArray(test2).length);
console.log("");

// Test case 3: Array dengan item berbeda
const test3 = ["Simpan di tempat sejuk", "Jauhkan dari jangkauan anak", "Konsultasi dokter jika hamil"];
console.log("Test 3 - Normal important info:");
console.log("Input:", test3);
console.log("Output:", deduplicateArray(test3));
console.log("Expected length: 3, Actual length:", deduplicateArray(test3).length);
console.log("");

// Test case 4: Array dengan whitespace dan empty strings
const test4 = ["Item 1", "", "  ", "Item 2"];
console.log("Test 4 - With empty and whitespace:");
console.log("Input:", test4);
console.log("Output:", deduplicateArray(test4));
console.log("Expected length: 2, Actual length:", deduplicateArray(test4).length);
