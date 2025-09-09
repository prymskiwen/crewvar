import { useEffect } from "react";
import { useQuickCheckIn } from "../context/QuickCheckInContext";

export const useShipCheckIn = () => {
    const { showCheckInDialog, setShowCheckInDialog } = useQuickCheckIn();

    useEffect(() => {
        // Check if user needs to confirm ship assignment
        const today = new Date().toISOString().split('T')[0];
        const lastConfirmedDate = localStorage.getItem('lastShipConfirmation');
        
        if (lastConfirmedDate !== today) {
            setShowCheckInDialog(true);
        }
    }, [setShowCheckInDialog]);

    return {
        needsCheckIn: showCheckInDialog
    };
};
