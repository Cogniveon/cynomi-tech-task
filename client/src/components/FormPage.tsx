import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";

import { postUserSleepData } from "../api";

const SLEEP_RECORD_SUCCESS_MSG = "Sleep record added successfully!";

const FormPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    sleepDuration: "",
    sleepDate: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ path: string[]; message: string }[]>(
    []
  );

  const mutation = useMutation<
    {},
    {
      errors: { code: string; message: string; path: string[] }[];
    },
    typeof formData
  >(
    async (newData) => {
      const formattedDate = format(new Date(newData.sleepDate), "MM/dd/yyyy");
      return await postUserSleepData({
        sleepDuration: parseInt(newData.sleepDuration),
        sleepDate: formattedDate,
        user: {
          name: newData.name,
          email: newData.email,
          gender: newData.gender,
        },
      });
    },
    {
      onSuccess: () => {
        setMessage(SLEEP_RECORD_SUCCESS_MSG);
        setFormData({
          name: "",
          email: "",
          gender: "",
          sleepDuration: "",
          sleepDate: "",
        });
        setErrors([]); // Clear errors on success
      },
      onError: (error) => {
        if (error.errors) {
          setErrors(error.errors);
          setMessage(null);
        } else {
          setMessage("An unexpected error occurred.");
        }
      },
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors([]); // Clear errors when user starts editing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl mb-5">Sleep Tracker</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.find((error) => error.path.includes("name", 1)) && (
            <p className="text-red-500 text-sm">
              {errors.find((error) => error.path.includes("name", 1))?.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.find((error) => error.path.includes("email")) && (
            <p className="text-red-500 text-sm">
              {errors.find((error) => error.path.includes("email"))?.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="TRANSGENDER">Transgender</option>
            <option value="GENDER_NEUTRAL">Gender Neutral</option>
            <option value="NON_BINARY">Non-binary</option>
            <option value="NOT_SPECIFIED">Not Specified</option>
          </select>
          {errors.find((error) => error.path.includes("gender")) && (
            <p className="text-red-500 text-sm">
              {errors.find((error) => error.path.includes("gender"))?.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">
            Sleep Duration (in hours)
          </label>
          <input
            type="number"
            name="sleepDuration"
            value={formData.sleepDuration}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.find((error) => error.path.includes("sleepDuration")) && (
            <p className="text-red-500 text-sm">
              {
                errors.find((error) => error.path.includes("sleepDuration"))
                  ?.message
              }
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="sleepDate"
            value={formData.sleepDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.find((error) => error.path.includes("sleepDate")) && (
            <p className="text-red-500 text-sm">
              {
                errors.find((error) => error.path.includes("sleepDate"))
                  ?.message
              }
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 ${
            message == SLEEP_RECORD_SUCCESS_MSG
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default FormPage;
