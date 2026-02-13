"use client"

import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    // Initialize state with the initial value
    const [storedValue, setStoredValue] = useState(initialValue);

    useEffect(() => {
        // Ensure this code runs only on the client side
        if (typeof window !== 'undefined') {
            try {
                // Retrieve the item from localStorage
                const item = window.localStorage.getItem(key);
                // Parse and set the stored value if it exists
                if (item) {
                    setStoredValue(JSON.parse(item));
                }
            } catch (error) {
                console.error(`Error reading localStorage key “${key}”:`, error);
            }
        }
    }, [key]);

    const setValue = (value) => {
        try {
            // Allow value to be a function for functional updates
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Update state
            setStoredValue(valueToStore);
            // Save to localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    };

    return [storedValue, setValue];
}

export { useLocalStorage };
