import { WelcomeSVG } from "../utils/WelcomeSVG";

export default function Welcome() {
  return (
    // Thêm flex, flex-col, justify-center, items-center và h-full để căn giữa tuyệt đối
    <div className="lg:col-span-2 flex flex-col justify-center items-center h-full w-full bg-white dark:bg-gray-900">
      <WelcomeSVG />
      <div className="text-center mt-4">
        <h2 className="text-xl text-gray-500 dark:text-gray-400">
          Select a Chat to Start Messaging
        </h2>
      </div>
    </div>
  );
}