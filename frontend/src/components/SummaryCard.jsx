const SummaryCard = ({ count, label }) => (
  <div className="flex flex-col items-center justify-center w-21 h-20 border-2 border-[#155ac1]  rounded-md bg-white shadow">
    <p className="text-xl font-bold">{count}</p>
    <p className="text-xs text-gray-700 text-center">{label}</p>
  </div>
);

export default SummaryCard;
