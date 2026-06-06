import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#F7F4EE]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
