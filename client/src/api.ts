export const fetchUsers = async (page: number, pageSize: number) => {
  const url = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await fetch(`/api/users?${url.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
};

export const fetchUserSleepData = async (userId: number) => {
  const response = await fetch(`/api/users/${userId}/sleepChartData`);

  if (!response.ok) {
    throw new Error("Failed to fetch sleep data");
  }

  return await response.json();
};

export const postUserSleepData = async ({
  sleepDuration,
  sleepDate,
  user,
}: {
  sleepDuration: number;
  sleepDate: string;
  user: {
    name: string;
    email: string;
    gender: string;
  };
}) => {
  const response = await fetch("/api/sleepRecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sleepDuration,
      sleepDate,
      user,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return await response.json();
};
