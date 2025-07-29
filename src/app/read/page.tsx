"use client";
import { useEffect, useState } from "react";
import db from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Define types for applicants and employers
type Applicant = {
  id: string;
  name: string;
  position: string;
  experience: string;
  location: string;
  phone: string;
};

type Employer = {
  id: string;
  name: string;
  company: string;
  position: string;
  experience: string;
  quantity: string;
  location: string;
  phone: string;
};

const ReadPage = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const applicantsSnapshot = await getDocs(collection(db, "applicants"));
        const employersSnapshot = await getDocs(collection(db, "employers"));

        // Map Firestore docs to typed arrays
        const applicantsData = applicantsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Applicant[];

        const employersData = employersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Employer[];

        setApplicants(applicantsData);
        setEmployers(employersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-6 text-center">
          Applicant & Employer List
        </h1>

        {/* Applicants */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Applicants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-xl text-gray-600 shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <p><span className="font-semibold">Name:</span> {app.name}</p>
                <p><span className="font-semibold">Position:</span> {app.position}</p>
                <p><span className="font-semibold">Experience:</span> {app.experience}</p>
                <p><span className="font-semibold">Location:</span> {app.location}</p>
                <p><span className="font-semibold">Phone:</span> {app.phone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Employers */}
        <div>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Employers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {employers.map((emp) => (
              <div
                key={emp.id}
                className="bg-white border border-gray-200 rounded-xl shadow-md text-gray-600 p-4 hover:shadow-lg transition-shadow"
              >
                <p><span className="font-semibold">Name:</span> {emp.name}</p>
                <p><span className="font-semibold">Company:</span> {emp.company}</p>
                <p><span className="font-semibold">Position:</span> {emp.position}</p>
                <p><span className="font-semibold">Experience:</span> {emp.experience}</p>
                <p><span className="font-semibold">Quantity:</span> {emp.quantity}</p>
                <p><span className="font-semibold">Location:</span> {emp.location}</p>
                <p><span className="font-semibold">Phone:</span> {emp.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadPage;
