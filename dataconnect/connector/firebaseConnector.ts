import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // Add other config values as needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const resolvers = {
  Query: {
    getEvent: async (_, { id }) => {
      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      } catch (error) {
        console.error('Error getting event:', error);
        throw new Error('Failed to fetch event');
      }
    },
    
    getAllEvents: async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const querySnapshot = await getDocs(eventsCollection);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting all events:', error);
        throw new Error('Failed to fetch events');
      }
    },
    
    getEventsByType: async (_, { type }) => {
      try {
        const eventsCollection = collection(db, 'events');
        const q = query(eventsCollection, where('type', '==', type));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting events by type:', error);
        throw new Error('Failed to fetch events by type');
      }
    }
  },
  
  Mutation: {
    createEvent: async (_, { input }) => {
      try {
        const eventsCollection = collection(db, 'events');
        const docRef = await addDoc(eventsCollection, input);
        
        return {
          id: docRef.id,
          ...input
        };
      } catch (error) {
        console.error('Error creating event:', error);
        throw new Error('Failed to create event');
      }
    },
    
    updateEvent: async (_, { id, input }) => {
      try {
        const eventRef = doc(db, 'events', id);
        await updateDoc(eventRef, input);
        
        const updatedDoc = await getDoc(eventRef);
        return {
          id: updatedDoc.id,
          ...updatedDoc.data()
        };
      } catch (error) {
        console.error('Error updating event:', error);
        throw new Error('Failed to update event');
      }
    },
    
    deleteEvent: async (_, { id }) => {
      try {
        const eventRef = doc(db, 'events', id);
        await deleteDoc(eventRef);
        return true;
      } catch (error) {
        console.error('Error deleting event:', error);
        throw new Error('Failed to delete event');
      }
    }
  }
};