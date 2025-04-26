import { useState } from "react";

const TabNavigation = ({ activeTab = "feed" }) => {
  const [active, setActive] = useState(activeTab);

  // We'll use this to handle navigation in real implementation
  const handleTabChange = (tab) => {
    setActive(tab);
    // In real implementation, we'd use navigate or history.push here
    window.location.href = `/${tab === "feed" ? "" : tab}`;
  };

  const tabs = [
    { id: "feed", name: "Skill Sharing", icon: "📷" },
    { id: "progress", name: "Learning Progress", icon: "📈" },
    { id: "plans", name: "Learning Plans", icon: "📋" },
  ];

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-1 flex justify-between shadow-sm border border-white border-opacity-20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            active === tab.id
              ? "bg-white bg-opacity-90 text-blue-600 shadow-sm"
              : "text-gray-600 hover:bg-white hover:bg-opacity-50"
          }`}
        >
          <span>{tab.icon}</span>
          <span className="font-medium">{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
