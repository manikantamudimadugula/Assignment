"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary?: string;
  company: {
    name: string;
    description: string;
    website?: string;
  };
  createdAt: string;
}

export default function JobDetailsPage({
  params,
}: {
  params: { jobId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "SEEKER") {
      router.push("/");
      return;
    }

    fetchJobDetails();
  }, [status, session, router, params.jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/seeker/jobs/${params.jobId}`);
      if (!response.ok) throw new Error("Failed to fetch job details");
      const data = await response.json();
      setJob(data);
    } catch (error) {
      toast.error("Failed to load job details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!job) return;
    setIsApplying(true);

    try {
      const response = await fetch(`/api/seeker/jobs/${params.jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Application submitted successfully");
      router.push("/seeker/applications");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Job not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>{job.company.name}</span>
                  <span className="mx-2">•</span>
                  <span>{job.location}</span>
                  <span className="mx-2">•</span>
                  <span>{job.type}</span>
                  {job.salary && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{job.salary}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isApplying ? "Applying..." : "Apply Now"}
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">
                About the Company
              </h2>
              <p className="mt-2 text-gray-600">{job.company.description}</p>
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-indigo-600 hover:text-indigo-900"
                >
                  Visit Website
                </a>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Job Description
              </h2>
              <div className="mt-2 prose prose-indigo max-w-none">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/seeker/dashboard"
                className="text-indigo-600 hover:text-indigo-900"
              >
                ← Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
