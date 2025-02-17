import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Firestore DB
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc
} from "firebase/firestore";

const CustomerTickets = ({ user }) => {
    const [tickets, setTickets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "Low" });

    // 🔹 Fetch customer's tickets
    useEffect(() => {
        if (user) {
            const q = query(collection(db, "tickets"), where("createdBy", "==", user.email));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            });
            return () => unsubscribe();
        }
    }, [user]);

    // ✅ Create a new ticket
    const handleCreateTicket = async () => {
        if (!newTicket.title || !newTicket.description) return;

        await addDoc(collection(db, "tickets"), {
            title: newTicket.title,
            description: newTicket.description,
            priority: newTicket.priority,
            status: "Open",
            createdBy: user.email,
            assignedTo: null,
            createdAt: new Date(),
        });

        setNewTicket({ title: "", description: "", priority: "Low" });
        setShowModal(false);
    };

    // ✅ Delete a ticket (only if created by the user)
    const handleDeleteTicket = async (id) => {
        await deleteDoc(doc(db, "tickets", id));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Tickets</h2>

            {/* Button to open the ticket creation modal */}
            <button
                onClick={() => setShowModal(true)}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
                Raise a Ticket
            </button>

            <div className="overflow-x-auto">
                <table className="w-full border bg-white shadow-lg rounded-lg">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Priority</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-t hover:bg-gray-100 transition">
                                    <td className="p-3 font-medium text-gray-700">{ticket.title}</td>
                                    <td className="p-3 text-gray-600">{ticket.description}</td>
                                    <td className="p-3 font-semibold text-red-500">{ticket.priority}</td>
                                    <td className="p-3 text-blue-600 font-semibold">{ticket.status}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDeleteTicket(ticket.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">
                                    No tickets found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Ticket Creation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl mb-4">Raise a Ticket</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newTicket.title}
                            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                            className="w-full p-2 border rounded-md mb-2"
                        />
                        <textarea
                            placeholder="Description"
                            value={newTicket.description}
                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                            className="w-full p-2 border rounded-md mb-2"
                        />
                        <button
                            onClick={handleCreateTicket}
                            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTickets;
