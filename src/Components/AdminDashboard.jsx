import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const AdminDashboard = ({ userRole }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(""); // Track the user ID for assignment
  const [message, setMessage] = useState(""); // To display success or error message

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const ticketsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          assignedTo: doc.data().assignedTo || "", // Ensure assignedTo is initialized as empty string
        }));
        setTickets(ticketsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load tickets.");
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Memoize functions to avoid re-renders
  const updateTicketStatus = useCallback(async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { status: newStatus });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }, []);

  const assignTicket = useCallback(async (ticketId, userId) => {
    if (!userId) {
      alert("Please enter a valid user ID.");
      return;
    }
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { assignedTo: userId });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, assignedTo: userId } : ticket
        )
      );
      setMessage("Ticket assigned successfully!"); // Success message
    } catch (err) {
      console.error("Error assigning ticket:", err);
      setMessage("Failed to assign ticket. Please try again."); // Error message
    }
  }, []);

  const updateTicketPriority = useCallback(async (ticketId, newPriority) => {
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { priority: newPriority });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, priority: newPriority } : ticket
        )
      );
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  }, []);

  // Handle click to assign ticket to a user
  const handleAssignClick = (ticketId) => {
    if (!userId) {
      alert("Please enter a user ID to assign the ticket.");
      return;
    }
    assignTicket(ticketId, userId);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {userRole === "support_agent" ? "Support Agent Dashboard" : "Admin Dashboard"} - Ticket Management
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>} {/* Display the message here */}
      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Assigned To</th>
              <th className="border p-2">Priority</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border">
                <td className="border p-2">{ticket.title}</td>
                <td className="border p-2">{ticket.description}</td>
                <td className="border p-2">
                  <select
                    className="border p-1"
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    className="border p-1"
                    placeholder="Enter user ID"
                    onChange={(e) => setUserId(e.target.value)} // Update userId on change
                  />
                </td>
                <td className="border p-2">
                  <select
                    className="border p-1"
                    value={ticket.priority}
                    onChange={(e) => updateTicketPriority(ticket.id, e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </td>
                <td className="border p-2">
                  <button
                    className={`${
                      userRole === "support_agent" || userRole === "Admin"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                    } px-3 py-1 rounded`}
                    onClick={() => handleAssignClick(ticket.id)} // Just pass the ticket ID
                  >
                    Take Action
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
