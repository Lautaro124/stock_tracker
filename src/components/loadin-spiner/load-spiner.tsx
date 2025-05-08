const LoadSpinner: React.FC = () => {
  return (
    <div className="flex items-center w-full h-full justify-center">
        <svg
          className="animate-spin h-10 w-10 text-gray-200 dark:text-gray-600"
          viewBox="3 3 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
          />
        </svg>
        <svg
          className="animate-spin h-10 w-10 text-gray-400 dark:text-gray-500"
          viewBox="3 3 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
          />
        </svg>
    </div>
  );
};

export default LoadSpinner;
