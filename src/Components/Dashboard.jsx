import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [role, setRole] = useState(""); // 'customer' or 'support_agent'
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "Low" });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [canCreateTicket, setCanCreateTicket] = useState(true); // Toggle for enabling/disabling ticket creation

    useEffect(() => {
        onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setRole(userDoc.data().role);
                }
                const q =
                    userDoc.data().role === "support_agent"
                        ? query(collection(db, "tickets"))
                        : query(collection(db, "tickets"), where("createdBy", "==", currentUser.email));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                });
                return () => unsubscribe();
            }
        });
    }, []);

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

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;
        await deleteDoc(doc(db, "tickets", ticketId));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex justify-center">Support Dashboard</h1>

            {role === "customer" && (
                <div className="flex justify-between mb-4">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={canCreateTicket}
                            onChange={() => setCanCreateTicket(!canCreateTicket)}
                        />
                        Enable Ticket Creation
                    </label>
                    {canCreateTicket && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            Raise Ticket
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border bg-white shadow-lg rounded-lg">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">Ticket ID</th>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Priority</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Created By</th>
                            <th className="p-3 text-left">Assigned To</th> {/* Added Assigned To */}
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-t hover:bg-gray-100 transition">
                                    <td className="p-3">{ticket.id}</td>
                                    <td className="p-3 font-medium text-gray-700">{ticket.title}</td>
                                    <td className="p-3 font-semibold text-red-500">{ticket.priority}</td>
                                    <td className="p-3 text-blue-600 font-semibold">{ticket.status}</td>
                                    <td className="p-3 text-gray-700">{ticket.createdBy}</td>
                                    <td className="p-3 text-gray-700">{ticket.assignedTo || "Unassigned"}</td> {/* Assigned To value */}
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                                        >
                                            View
                                        </button>
                                        {(role === "support_agent" || ticket.createdBy === user.email) && (
                                            <button
                                                onClick={() => handleDeleteTicket(ticket.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                            >
                                                Delete Ticket
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-gray-500">No tickets available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                        <button onClick={handleCreateTicket} className="w-full bg-blue-500 text-white p-2 rounded-md">
                            Submit
                        </button>
                        <button onClick={() => setShowModal(false)} className="w-full mt-2 bg-gray-400 text-white p-2 rounded-md">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl mb-4">Ticket Details</h2>
                        <p><strong>Title:</strong> {selectedTicket.title}</p>
                        <p><strong>Description:</strong> {selectedTicket.description}</p>
                        <p><strong>Priority:</strong> {selectedTicket.priority}</p>
                        <p><strong>Status:</strong> {selectedTicket.status}</p>
                        <p><strong>Created By:</strong> {selectedTicket.createdBy}</p>
                        <p><strong>Assigned To:</strong> {selectedTicket.assignedTo || "Unassigned"}</p> {/* Assigned To value */}
                        <button onClick={() => setSelectedTicket(null)} className="w-full mt-4 bg-green-400 text-black p-2 rounded-md">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
