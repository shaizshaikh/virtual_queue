"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueueActionModal from "@/components/QueueActionModal";

const URL = process.env.NEXT_PUBLIC_EXPRESS_URL || "http://localhost:5000";

export default function Home() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  // ✅ Fetch queues from backend
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const response = await fetch(`${URL}/queues`);
        if (!response.ok) throw new Error("Failed to fetch queues");
        const data = await response.json();
        setQueues(data);
      } catch (error) {
        console.error("Error fetching queues:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQueues();
  }, []);

  // ✅ Verify user status using checkUser on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("queueUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const verifyUser = async () => {
          try {
            const response = await fetch(`${URL}/checkUser?email=${user.email}`);
            if (!response.ok) throw new Error("Your entry is cleared from the queue!");

            const data = await response.json();
            if (data.success) {
              if (data.user.queue_id) {
                setUserData(data.user);
                localStorage.setItem("queueUser", JSON.stringify(data.user));
              } else {
                console.log("User is not in any queue.");
                setUserData(null);
                localStorage.removeItem("queueUser");
              }
            } else {
              // ✅ User not found or verification failed
              toast.info("You are no longer in this queue.");
              setUserData(null);
              localStorage.removeItem("queueUser");
            }
          } catch (error) {
            // ✅ Handle API or network error
            toast.error(error.message || "Error verifying user. Please try again.");
            setUserData(null);
            localStorage.removeItem("queueUser");
          }
        };

        verifyUser();
      } catch (error) {
        // ✅ Handle invalid localStorage data
        console.error("Error parsing stored user data:", error.message);
        toast.error("Error reading user data. Please try logging in again.");
        localStorage.removeItem("queueUser");
        setUserData(null);
      }
    }
  }, []);

  // ✅ Handle successful join (Manually update userData)
  const handleJoinSuccess = (userId, firstname, lastname, email, queueId) => {
    const user = { user_id: userId, firstname, lastname, email, queue_id: queueId };
    setUserData(user);
    localStorage.setItem("queueUser", JSON.stringify(user));
  };

  const handleLeaveSuccess = () => {
    setUserData(null);
    localStorage.removeItem("queueUser");
  };

  // ✅ Log updates for better debugging
  useEffect(() => {
    if (userData) {
      console.log("User data updated:", userData);
    }
  }, [userData]);

  // ✅ Handle button click for join or leave action
  const handleActionClick = (queueId, mode) => {
    setSelectedQueue(queueId);
    setModalMode(mode);
  };

  // ✅ Check if user is in the queue using real-time data
  const isInQueue = (queueId) => {
    return userData && userData.queue_id === queueId;
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Virtual Queue</h1>

      {loading ? (
        <p>Loading queues...</p>
      ) : queues.length === 0 ? (
        <p>No queues available.</p>
      ) : (
        <ul>
          {queues.map((queue) => (
            <li key={queue.queue_id} className="mb-4 p-4 border rounded">
              <h2 className="text-xl">{queue.queue_name}</h2>
              <p>{queue.description}</p>
              <p>Status: {queue.status}</p>
              <button
                onClick={() =>
                  handleActionClick(
                    queue.queue_id,
                    isInQueue(queue.queue_id) ? "leave" : "join"
                  )
                }
                className={`mt-2 px-4 py-2 rounded ${
                  isInQueue(queue.queue_id)
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isInQueue(queue.queue_id) ? "Leave Queue" : "Join Queue"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalMode && (
        <QueueActionModal
          mode={modalMode}
          queueId={selectedQueue}
          userId={userData?.user_id || uuidv4()}
          onClose={() => {
            setSelectedQueue(null);
            setModalMode(null);
          }}
          onJoinSuccess={handleJoinSuccess}
          onLeaveSuccess={handleLeaveSuccess}
        />
      )}

      {/* ✅ ToastContainer for showing notifications */}
      <ToastContainer />
    </main>
  );
}
