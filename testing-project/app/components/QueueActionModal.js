"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_EXPRESS_URL || "http://localhost:5001";

export default function QueueActionModal({ 
  mode, 
  queueId, 
  userId, 
  onClose, 
  onJoinSuccess, 
  onLeaveSuccess 
}) {
  const [user, setUser] = useState({ firstname: "", lastname: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "join") {
      setUser({ firstname: "", lastname: "", email: "" });
      setError("");
    }
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "join") {
      if (!user.firstname || !user.lastname || !user.email) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }

      try {
        // Check if user is already in a queue
        const checkResponse = await fetch(`${URL}/checkUser?email=${user.email}`);
        const checkData = await checkResponse.json();

        if (checkResponse.ok && checkData.success) {
          if (checkData.user.queue_id) {
            toast.info(`You are already in queue ${checkData.user.queue_id}.`);

            const confirmContinue = window.confirm("Do you want to continue waiting?");
            
            if (confirmContinue) {
              localStorage.setItem("queueUser", JSON.stringify(checkData.user));
              onJoinSuccess(checkData.user.user_id, user.firstname, user.lastname, user.email, checkData.user.queue_id);
              toast.success("Continuing in the queue.");
              setLoading(false);
              onClose();
              return;
            } else {
              toast.warn("You can leave the queue if you wish.");
              setLoading(false);
              return;
            }
          }
        }

        // Join the queue
        const joinPayload = { ...user, queueId, userId };
        const joinResponse = await fetch(`${URL}/joinQueue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(joinPayload),
        });

        if (!joinResponse.ok) {
          const joinData = await joinResponse.json();
          throw new Error(joinData.message || "Failed to join the queue");
        }

        onJoinSuccess(userId, user.firstname, user.lastname, user.email, queueId);
        toast.success("Successfully joined the queue!");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
        onClose();
      }
    } else if (mode === "leave") {
      try {
        const leaveResponse = await fetch(`${URL}/leaveQueue`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queueId, userId }),
        });

        if (!leaveResponse.ok) {
          const leaveData = await leaveResponse.json();
          throw new Error(leaveData.message || "Failed to leave the queue");
        }

        onLeaveSuccess();
        toast.success("Successfully left the queue!");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg w-80">
        <h2 className="text-lg font-semibold text-center mb-4">
          {mode === "join" ? "Join Queue" : "Leave Queue"}
        </h2>
        
        {mode === "join" ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={user.firstname}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={user.lastname}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
              {loading ? "Processing..." : "Join Queue"}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-center">Are you sure you want to leave the queue?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={handleSubmit} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded">
                {loading ? "Leaving..." : "Confirm Leave"}
              </button>
              <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
