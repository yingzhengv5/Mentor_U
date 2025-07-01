import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero section with background */}
      <div className="relative h-[600px]">
        <Image
          src="/background.png"
          alt="Mentorship Platform"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect. Learn. Grow.
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Your journey from education to employment starts with a mentor
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg
              font-semibold hover:bg-indigo-700 transition-colors duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg shadow-lg bg-white">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Find Mentors
              </h3>
              <p className="text-gray-600">
                Connect with experienced professionals in your field
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg shadow-lg bg-white">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Learn Skills
              </h3>
              <p className="text-gray-600">
                Develop new skills with personalized guidance
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg shadow-lg bg-white">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Build Network
              </h3>
              <p className="text-gray-600">
                Create meaningful professional connections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
