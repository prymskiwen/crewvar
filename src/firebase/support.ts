import { 
    collection, 
    doc,
    addDoc,
    getDocs, 
    updateDoc, 
    query, 
    orderBy, 
    serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Support Ticket Interface
export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    adminResponse?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Create support ticket
export const createSupportTicket = async (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'supportTickets'), {
            ...ticketData,
            status: 'open',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        console.log('✅ Support ticket created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating support ticket:', error);
        throw error;
    }
};

// Get all support tickets (admin only)
export const getSupportTickets = async (): Promise<SupportTicket[]> => {
    try {
        const ticketsRef = collection(db, 'supportTickets');
        const q = query(ticketsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const tickets: SupportTicket[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tickets.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as SupportTicket);
        });
        
        return tickets;
    } catch (error) {
        console.error('❌ Error fetching support tickets:', error);
        throw error;
    }
};

// Update support ticket status
export const updateSupportTicketStatus = async (ticketId: string, status: SupportTicket['status']): Promise<void> => {
    try {
        const ticketRef = doc(db, 'supportTickets', ticketId);
        await updateDoc(ticketRef, {
            status,
            updatedAt: serverTimestamp()
        });
        console.log('✅ Support ticket status updated:', ticketId, status);
    } catch (error) {
        console.error('❌ Error updating support ticket status:', error);
        throw error;
    }
};

// Add admin response to support ticket
export const addSupportTicketResponse = async (ticketId: string, adminResponse: string): Promise<void> => {
    try {
        const ticketRef = doc(db, 'supportTickets', ticketId);
        await updateDoc(ticketRef, {
            adminResponse,
            status: 'resolved',
            updatedAt: serverTimestamp()
        });
        console.log('✅ Admin response added to support ticket:', ticketId);
    } catch (error) {
        console.error('❌ Error adding admin response:', error);
        throw error;
    }
};
