import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function getLatestJobs() {
  try {
    const jobs = await prisma.job.findMany({
      take: 6,
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default async function Home() {
  const latestJobs = await getLatestJobs();
  const session = await getServerSession(authOptions);

  // Determine the correct links based on authentication status and role
  const getStartedLink = session
    ? session.user.role === "SEEKER"
      ? "/seeker/dashboard"
      : session.user.role === "COMPANY"
      ? "/company/dashboard"
      : "/register"
    : "/register";

  const browseJobsLink = session?.user.role === "SEEKER" 
    ? "/seeker/dashboard"
    : "/login?from=/seeker/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find Your Dream Job</span>
              <span className="block text-indigo-600">
                Start Your Journey Today
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with top companies and opportunities that match your
              skills and aspirations.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href={getStartedLink}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  href={browseJobsLink}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Jobs Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Latest Job Opportunities
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {latestJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {job.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{job.company.name}</p>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">{job.location}</span>
                  <span>{job.type}</span>
                </div>
                {job.salary && (
                  <p className="mt-2 text-sm text-gray-500">
                    Salary: {job.salary}
                  </p>
                )}
              </div>
              <div className="px-4 py-4 sm:px-6">
                <Link
                  href={`/seeker/jobs/${job.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={browseJobsLink}
            className="text-base font-medium text-indigo-600 hover:text-indigo-500"
          >
            View All Jobs
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Our Platform?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              We connect talented professionals with amazing opportunities.
            </p>
          </div>
          <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <dt className="text-lg leading-6 font-medium text-gray-900">
                Easy Application Process
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Apply to multiple jobs with just a few clicks and track your
                applications.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg leading-6 font-medium text-gray-900">
                Company Profiles
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Learn about companies and their culture before applying.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg leading-6 font-medium text-gray-900">
                Job Alerts
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Get notified about new opportunities that match your
                preferences.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

