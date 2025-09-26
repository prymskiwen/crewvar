// Calendar data utilities for date formatting and calculations

export const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const endFormatted = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return `${startFormatted} - ${endFormatted}`;
};

export const getDaysDifference = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
};

export const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return checkDate >= start && checkDate <= end;
};

export const getDateStatus = (date: string): 'past' | 'current' | 'future' => {
    const checkDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkDate < today) return 'past';
    if (checkDate > today) return 'future';
    return 'current';
};
