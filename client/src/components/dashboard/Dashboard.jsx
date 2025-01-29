import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDelete } from "react-icons/md";
import { MdOutlineDone } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [newHabitDays, setNewHabitDays] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const navigate = useNavigate();

  // Function to get badge based on total points
  const getBadgeForPoints = (points) => {
    if (points >= 8000) return "Crystal 🏆";
    if (points >= 4000) return "Gold 🥇";
    if (points >= 2000) return "Silver 🥈";
    if (points >= 100) return "Bronze 🥉";
    if (points > 0) return "Newbie 👶";
    return "No Badge";
  };

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setHabits(data.habits || []);
      setTotalPoints(data.totalPoints || 0);
      setBadges(data.badges || []);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
      toast.error("Error during logout");
    }
  };

  const addHabit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + parseInt(newHabitDays));

    const newHabit = {
      name: newHabitName,
      description: newHabitDescription,
      streak: 0,
      lastCompleted: null,
      endDate: endDate.toISOString().split("T")[0], //need explanation here
      completedDays: 0,
    };

    const userDocRef = doc(db, "users", user.uid); //diff bw this and userDoc?

    try {
      await updateDoc(userDocRef, {
        habits: arrayUnion(newHabit),
      });

      setHabits((prev) => [...prev, newHabit]);
      setNewHabitName("");
      setNewHabitDescription("");
      setNewHabitDays(0);

      toast.success(`Habit "${newHabit.name}" added successfully!`, {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to add habit. Try again.", {
        position: "top-center",
      });
    }
  };

  const deleteHabit = async (habit) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userDocRef, {
        habits: arrayRemove(habit),
      });

      setHabits((prev) => prev.filter((h) => h !== habit)); //confusing part

      toast.info(`Habit "${habit.name}" deleted.`, {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to delete habit. Try again.", {
        position: "top-center",
      });
    }
  };

  const markAsComplete = async (habit) => {
    const user = auth.currentUser;
    if (!user) return;

    const updatedHabit = {
      ...habit,
      streak: habit.streak + 1,
      lastCompleted: new Date().toISOString(), //don't understand this
      completedDays: habit.completedDays + 1,
    };

    const userDocRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userDocRef, {
        habits: arrayRemove(habit),
      });

      await updateDoc(userDocRef, {
        habits: arrayUnion(updatedHabit),
      });

      setHabits(
        (prev) => prev.map((h) => (h.name === habit.name ? updatedHabit : h)) //don't understand this
      );

      // Set completed habit to show the "Done for today!" message
      setCompletedHabits((prev) => ({
        ...prev,
        [habit.name]: true, //don't understand this
      }));

      toast.success(`Habit "${habit.name}" marked as complete!`, {
        position: "top-center",
      });

      // Hide the "Done for today!" message after 5 seconds (optional)
      setTimeout(() => {
        setCompletedHabits((prev) => ({
          ...prev,
          [habit.name]: false, //don't understand this
        }));
      }, 5000);
    } catch (error) {
      toast.error("Failed to mark habit as complete. Try again.", {
        position: "top-center",
      });
    }
  };

  const calculateRemainingDays = (endDate) => {
    //don't understand this
    const today = new Date();
    const end = new Date(endDate);
    const remaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };

  const addPointsForStreak = (habitStreak) => {
    if (habitStreak >= 10) return 30;
    if (habitStreak >= 5) return 20;
    if (habitStreak >= 1) return 10;
    return 0;
  };

  const updatePointsAndBadges = async () => {
    //don't understand this
    const user = auth.currentUser;
    if (!user) return;

    const newPoints = habits.reduce(
      (acc, habit) => acc + addPointsForStreak(habit.streak),
      0
    );
    const badge = getBadgeForPoints(newPoints);

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      totalPoints: newPoints,
      badges: arrayUnion(badge),
    });

    setTotalPoints(newPoints);
    setBadges([badge]);
  };

  const checkIfMarkable = (lastCompletedDate) => {
    const today = new Date();
    const lastCompleted = new Date(lastCompletedDate);
    // If the habit was last completed today, return false
    return lastCompleted.toDateString() !== today.toDateString();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    updatePointsAndBadges();
  }, [habits]);

  const chartData = habits.map((habit) => ({
    name: habit.name,
    streak: habit.streak,
    remainingDays: calculateRemainingDays(habit.endDate),
  }));

  return (
    <div className="dashboard-container">
      {/* <ToastContainer /> */}
      <div className="dashboard-header">
        <h1 class="animated-gradient-text">Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="badge-section">
        <h2>Badge: {badges[0] || "No Badge"}</h2>
        <p className="total-points">Total Points: {totalPoints}</p>
      </div>

      <div className="habit-tracker">
        <div className="habit-creation">
          <h2 className="habit-creation-title">Create a New Habit</h2>
          <form>
            <input
              type="text"
              placeholder="Habit Name"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Habit Description"
              value={newHabitDescription}
              onChange={(e) => setNewHabitDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Days to Complete"
              value={newHabitDays}
              onChange={(e) => setNewHabitDays(e.target.value)}
            />
            <button type="button" className="add-habit-btn" onClick={addHabit}>
              <FaPlus /> Add Habit
            </button>
          </form>
        </div>

        <div className="habits-list-container">
          <h2 className="habit-creation-title">Your Habits</h2>
          <div className="habits-list">
            <ul>
              {habits.map((habit, index) => (
                <li key={index}>
                  <h3 className="habit-creation-title">{habit.name}</h3>
                  <p>{habit.description}</p>
                  <p>Streak: {habit.streak} days</p>
                  <p>Days Remaining: {calculateRemainingDays(habit.endDate)}</p>
                  <div className="btn-container">
                    <button
                      className="del-btn"
                      onClick={() => deleteHabit(habit)}
                    >
                      Delete <MdDelete />
                    </button>
                    {checkIfMarkable(habit.lastCompleted) && (
                      <>
                        <button
                          className="comp-btn"
                          onClick={() => markAsComplete(habit)}
                        >
                          Mark as Complete <MdOutlineDone />
                        </button>
                        {completedHabits[habit.name] && <p>Done for today!</p>}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h2>Habit Progress</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="streak" fill="#8884d8" />
            <Bar dataKey="remainingDays" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
