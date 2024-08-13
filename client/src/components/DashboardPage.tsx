import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { animated, useTransition } from "@react-spring/web";
import ReactEcharts from "echarts-for-react";

import { fetchUsers, fetchUserSleepData } from "../api";

const DashboardPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [loadingSleepData, setLoadingSleepData] = useState(false);
  const [errorSleepData, setErrorSleepData] = useState<string | null>(null);

  const { data, error, isLoading } = useQuery(
    ["users", page, pageSize],
    () => fetchUsers(page, pageSize),
    {
      keepPreviousData: true,
    }
  );

  const transitions = useTransition(selectedUser, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    onRest: async () => {
      if (selectedUser) {
        setLoadingSleepData(true);
        setErrorSleepData(null);

        try {
          const data = await fetchUserSleepData(selectedUser);
          setSleepData(data);
        } catch (error) {
          setErrorSleepData("Failed to load sleep data.");
        } finally {
          setLoadingSleepData(false);
        }
      }
    },
    config: { tension: 250, friction: 20 },
  });

  const handleRowClick = (userId: number) => {
    if (userId === selectedUser) {
      setSelectedUser(null);
    } else {
      setSelectedUser(userId);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const getOption = () => {
    return {
      tooltip: {},
      xAxis: {
        type: "category",
        data: sleepData.map((record: any) => record.date),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: sleepData.map((record: any) => record.sleepDuration),
          type: "bar",
          // smooth: true,
        },
      ],
    };
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{(error as Error).message}</p>;

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 mt-10">
      <h1 className="text-2xl sm:text-3xl mb-5 text-center font-semibold text-gray-800">
        Users Table
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                Gender
              </th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                Record Count
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.data.length === 0 && (
                <tr
                className="bg-gray-50"
                >
                <td colSpan={3} className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-500 text-xs sm:text-sm cursor-pointer hover:bg-gray-200">
                  No users found!
                </td>
                </tr>
            )}
            {data?.data.map((user: any, index: number) => (
              <tr
                key={user.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                onClick={() => handleRowClick(user.id)}
              >
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 text-xs sm:text-sm cursor-pointer hover:bg-gray-200">
                  {user.name}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 text-xs sm:text-sm">
                  {user.gender}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 text-xs sm:text-sm">
                  {user.recordCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.data.length !== 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-3 py-2 sm:px-4 sm:py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium ${
                page === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === data?.meta.totalPages}
              className={`ml-2 px-3 py-2 sm:px-4 sm:py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium ${
                page === data?.meta.totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </button>
          </div>
          <div>
            <span className="text-xs sm:text-sm text-gray-700">
              Page {page} of {data?.meta.totalPages}
            </span>
          </div>
          <div className="flex items-center">
            <label
              htmlFor="pageSize"
              className="mr-2 text-xs sm:text-sm font-medium text-gray-700"
            >
              Rows per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="p-1 sm:p-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      )}

      {transitions(
        (styles, item) =>
          item &&
          !loadingSleepData && (
            <animated.div style={styles} className="mt-8">
              {errorSleepData ? (
                <p className="text-red-500">{errorSleepData}</p>
              ) : (
                <ReactEcharts
                  option={getOption()}
                  style={{ height: "400px", width: "100%" }}
                />
              )}
            </animated.div>
          )
      )}
    </div>
  );
};

export default DashboardPage;
